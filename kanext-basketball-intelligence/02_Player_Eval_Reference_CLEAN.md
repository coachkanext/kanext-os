# UI SYSTEM SET

UI SYSTEM SET — v2 (LOCKED)
Purpose
The UI System Set defines the valid offensive and defensive system selections available to
coaches during Coach Context Setup. No evaluation, weighting, or normalization logic lives
here. System trait weighting is governed by the System Fit docs.
Offensive Systems (12)
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
Defensive Systems (10)
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
Governance
System names must exactly match across all downstream docs: System Demand Profiles,
System Fit (Offensive + Defensive Trait Weighting), OSIE/DSIE, System × System Interaction,
Archetype × System Interaction. No aliases permitted. Any addition or removal requires
documentation, versioning, and approval.


# TRAIT LIBRARY

Trait Library

KaNeXT Trait Clusters — Canonical 8 (name set)
1. Shooting
(includes spacing/gravity/shot versatility as sub-traits — but cluster name stays
simple)
2. Finishing
(includes rim pressure, contact, foul draw, touch, transition finishing)
3. Playmaking
(includes advantage creation, handle, passing, creation reads)
4. POA Defense
(Point-of-Attack; on-ball, screen nav, containment, ball pressure)
5. Team Defense
(help, rotations, rim protection, communication, scheme execution)
6. Rebounding
(ORB/DRB, box-out, pursuit, contested boards)
7. Tools
(size/length, strength, speed, lateral, vertical, motor/endurance)
8. IQ
(decision quality + processing; avoids “vibes” by being tagged behaviors)

Shooting Cluster — Locked Traits (6)
1) 3PT Spot-Up
Synergy / PlayVision (TRUE)
● Counts: 3PA where dribble_count = 0 AND no movement-action tag (no off-screen,
no DHO chase, no relocation)
● Excludes: anything tagged as Movement; anything with dribble_count ≥ 1
● Inputs: Spot-Up 3P% ; Spot-Up 3PA/G
● Tags (for slicing/evidence): defender distance, contest class, location
(corner/wing/slot), shot clock, catch→release time, balance state
College bands (v0)
● 90: 42%+ & 3.5+
● 80: 38–41% & 2.5–3.4
● 70: 35–37% & 1.8–2.4
● 60: 31–34% & 1.0–1.7
● <60: <31% or low volume
Pro bands (v0)
● 90: 44%+ & 4.0+
● 80: 41–43% & 3.0–3.9
● 70: 38–40% & 2.0–2.9
● 60: 35–37% & 1.0–1.9
● <60: <35% or minimal volume
Box-score mode
● PROXY
● Inputs: overall 3P%, 3PA/G
● Score: round(0.70*Band(3P%) + 0.30*Band(3PA/G))
2) 3PT Movement
Synergy / PlayVision (TRUE)
● Counts: 3PA tagged as movement shot (off-screen / pindown / flare / stagger / DHO
chase / relocation drift-lift-shake) with dribble_count = 0
● Excludes: any self-created dribble shots (Pull-Up) and any no-action stationary C&S
(Spot-Up)

● Inputs: Movement 3P% ; Movement 3PA/G
● Tags: action type, screen type/angle, relocation type, sprint speed into catch, defender
distance, contest class, catch→release, balance state, shot clock
College bands (v0)
● 90: 40%+ & 2.5+
● 80: 37–39% & 1.8–2.4
● 70: 34–36% & 1.2–1.7
● 60: 30–33% & 0.6–1.1
● <60: <30% or minimal volume
Pro bands (v0)
● 90: 42%+ & 3.0+
● 80: 39–41% & 2.2–2.9
● 70: 36–38% & 1.5–2.1
● 60: 33–35% & 0.8–1.4
● <60: <33% or minimal volume
Box-score mode
● UNSCORED (null)
3) 3PT Pull-Up
Synergy / PlayVision (TRUE)
● Counts: 3PA where dribble_count ≥ 1 OR tagged as self-created 3 (iso / PnR BH /
stepback / sidestep / transition pull-up)
● Excludes: movement-tagged no-dribble shots (Movement) and stationary no-dribble
shots (Spot-Up)
● Inputs: Pull-Up 3P% ; Pull-Up 3PA/G
● Tags: dribble count, creation type, separation at release (if available), defender distance,
contest class, stepback/sidestep, shot clock, directionality
College bands (v0)
● 90: 38%+ & 2.0+
● 80: 35–37% & 1.4–1.9
● 70: 32–34% & 0.9–1.3
● 60: 28–31% & 0.4–0.8
● <60: <28% or minimal volume

Pro bands (v0)
● 90: 40%+ & 3.0+
● 80: 37–39% & 2.2–2.9
● 70: 34–36% & 1.6–2.1
● 60: 31–33% & 1.0–1.5
● <60: <31% or minimal volume
Box-score mode
● UNSCORED (null)
4) 3PT Deep Range
Synergy / PlayVision (TRUE)
● Counts: 3PA where shot_distance ≥ deep-range threshold (define once; e.g., NBA
range / “beyond line + X ft”) OR tagged as deep-range
● Allows: any creation type (spot / movement / pull-up) as long as it qualifies by
distance/tag
● Inputs: Deep Range 3P% ; Deep Range 3PA/G
● Tags: exact shot distance, location band, creation type (spot/move/pull), contest class,
shot clock, balance state
College bands (v0)
● 90: 38%+ & 1.5+
● 80: 35–37% & 1.0–1.4
● 70: 32–34% & 0.6–0.9
● 60: 28–31% & 0.3–0.5
● <60: <28% or minimal volume
Pro bands (v0)
● 90: 40%+ & 2.0+
● 80: 37–39% & 1.4–1.9
● 70: 34–36% & 0.9–1.3
● 60: 31–33% & 0.5–0.8
● <60: <31% or minimal volume
Box-score mode
● UNSCORED (null)

5) Midrange Shotmaking
Synergy / PlayVision (TRUE)
● Counts: all 2PT jumpers inside the midrange band (exclude rim attempts + exclude
3PA)
● Includes: pull-ups, turnarounds, post fades, short pull-ups, stepbacks in 2PT range
● Inputs: Midrange FG% ; Midrange FGA/G
● Tags: shot distance band, creation type (pull-up/post/iso/PnR), contest class, balance,
shot clock
College bands (v0)
● 90: 48%+ & 3.0+
● 80: 44–47% & 2.0–2.9
● 70: 40–43% & 1.3–1.9
● 60: 36–39% & 0.7–1.2
● <60: <36% or minimal volume
Pro bands (v0)
● 90: 52%+ & 3.5+
● 80: 47–51% & 2.4–3.4
● 70: 43–46% & 1.6–2.3
● 60: 39–42% & 0.9–1.5
● <60: <39% or minimal volume
Box-score mode
● UNSCORED (null) (unless you have 2PT jump-shot splits; most box feeds don’t)
6) Free Throw
Synergy / PlayVision (TRUE)
● Counts: all FT attempts
● Inputs: FT% ; FTA/G
● Tags: (optional) shooting foul type, end-of-game intentional, technicals (for evidence
only)
College bands (v0)

● 90: 88%+ & 4.0+
● 80: 80–87% & 3.0–3.9
● 70: 73–79% & 2.0–2.9
● 60: 65–72% & 1.0–1.9
● <60: <65% or low volume
Pro bands (v0)
● 90: 90%+ & 5.0+
● 80: 84–89% & 3.8–4.9
● 70: 77–83% & 2.6–3.7
● 60: 70–76% & 1.4–2.5
● <60: <70% or low volume
Box-score mode
● TRUE (not proxy)
● Inputs: FT% (FTM/FTA), FTA/G
● Score: round(0.70*Band(FT%) + 0.30*Band(FTA/G))

Finishing Cluster — Locked Traits (6)
1) Rim Pressure
Synergy / PlayVision (TRUE)
● Counts: possessions where player creates a rim attempt for self (drive to rim, cut to
rim, leakout to rim, post move to rim)
● Inputs: Rim Attempts / G ; Rim Attempts per Touch (or per 100 touches)
● Tags: drive, cut, post, transition; paint touch; rim attempt; help committed; defender at
rim; shot clock
College bands (v0)
● 90: 6.0+ rim att/G AND high rim frequency
● 80: 4.5–5.9
● 70: 3.2–4.4
● 60: 2.0–3.1
● <60: <2.0
Pro bands (v0)
● 90: 8.0+
● 80: 6.0–7.9
● 70: 4.5–5.9
● 60: 3.0–4.4
● <60: <3.0
Box-score mode
● PROXY
● Inputs: FTA/G + 2PA/G (if available) as rim-pressure proxy
● Score: 0.60*Band(FTA/G) + 0.40*Band(2PA/G) (or UNSCORED if 2PA not
available)
2) Contact Finishing
Synergy / PlayVision (TRUE)
● Counts: rim attempts tagged with contact (body contact at gather/release) or contest =
guarded/contested
● Inputs: Contact Rim FG% ; Contact Rim Attempts / G

● Tags: contact flag, contest class, defender at rim, angle, hand (R/L), body control,
balance
College bands (v0)
● 90: 65%+ & 2.0+
● 80: 58–64% & 1.4–1.9
● 70: 52–57% & 0.9–1.3
● 60: 45–51% & 0.4–0.8
● <60: <45% or low volume
Pro bands (v0)
● 90: 70%+ & 2.5+
● 80: 63–69% & 1.8–2.4
● 70: 56–62% & 1.2–1.7
● 60: 48–55% & 0.7–1.1
● <60: <48% or low volume
Box-score mode
● UNSCORED (null)
3) Touch / Craft
Synergy / PlayVision (TRUE)
● Counts: non-dunk finishes requiring touch: floaters/runners, wrong-foot, inside-hand,
reverses, high-glass, extension finishes
● Inputs: Touch FG% (defined shot set) ; Touch Attempts / G
● Tags: floater/runner, reverse, scoop, wrong-foot, inside-hand, angle, defender location,
balance
College bands (v0)
● 90: 55%+ & 1.8+
● 80: 50–54% & 1.2–1.7
● 70: 45–49% & 0.8–1.1
● 60: 40–44% & 0.4–0.7
● <60: <40% or low volume
Pro bands (v0)
● 90: 60%+ & 2.0+

● 80: 54–59% & 1.4–1.9
● 70: 48–53% & 0.9–1.3
● 60: 42–47% & 0.5–0.8
● <60: <42% or low volume
Box-score mode
● UNSCORED (null)
4) Foul Draw
Synergy / PlayVision (TRUE)
● Counts: shooting fouls drawn on drives/post/rim attempts (exclude intentional/tech)
● Inputs: And-1s + Shooting Fouls Drawn / G ; FTA per Rim Attempt
● Tags: foul type, location, defender position, bonus state, shot clock
College bands (v0)
● 90: FTA/RimAtt 0.45+ & high volume
● 80: 0.36–0.44
● 70: 0.28–0.35
● 60: 0.20–0.27
● <60: <0.20
Pro bands (v0)
● 90: 0.50+
● 80: 0.40–0.49
● 70: 0.32–0.39
● 60: 0.24–0.31
● <60: <0.24
Box-score mode
● PROXY
● Inputs: FTA/G + FT rate = FTA/FGA (if FGA available)
● Score: 0.70*Band(FTA/G) + 0.30*Band(FT rate)
5) Vertical Finishing
Synergy / PlayVision (TRUE)

● Counts: dunks + lob finishes + above-rim rim attempts
● Inputs: Dunk/Lob FG% ; Dunk/Lob Attempts / G
● Tags: dunk, lob, alley-oop, putback dunk, defender at rim, contest class
College bands (v0)
● 90: 85%+ & 1.8+
● 80: 78–84% & 1.2–1.7
● 70: 70–77% & 0.8–1.1
● 60: 62–69% & 0.4–0.7
● <60: <62% or low volume
Pro bands (v0)
● 90: 90%+ & 2.2+
● 80: 83–89% & 1.5–2.1
● 70: 75–82% & 1.0–1.4
● 60: 68–74% & 0.5–0.9
● <60: <68% or low volume
Box-score mode
● UNSCORED (null)
6) Transition Finishing
Synergy / PlayVision (TRUE)
● Counts: transition rim attempts (including leakouts, early offense)
● Inputs: Transition Rim FG% ; Transition Rim Attempts / G
● Tags: possession type = transition, advantage state (numbers), defender position,
gather type
College bands (v0)
● 90: 75%+ & 2.0+
● 80: 68–74% & 1.4–1.9
● 70: 60–67% & 0.9–1.3
● 60: 52–59% & 0.4–0.8
● <60: <52% or low volume
Pro bands (v0)
● 90: 80%+ & 2.5+

● 80: 72–79% & 1.8–2.4
● 70: 64–71% & 1.2–1.7
● 60: 56–63% & 0.6–1.1
● <60: <56% or low volume
Box-score mode
● UNSCORED (null)

Playmaking Cluster — Locked Traits (7)
1) Advantage Creation
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions where player bends the defense (blow-by, forces help,
creates rotation) via iso / PnR BH / drive / post-face
● Inputs: Help-Commit Rate (help drawn per drive/touch) ; Advantage Drives / G (or
advantage events / G)
● Tags: drive, blow-by, help source (nail/low-man), two-on-ball, rotation triggered, paint
touch, separation, shot clock
College bands (v0)
● 90: high help rate + 7.0+ advantage events/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Pro bands (v0)
● 90: high help rate + 10.0+
● 80: 8.0–9.9
● 70: 6.0–7.9
● 60: 4.0–5.9
● <60: <4.0
Box-score mode
● PROXY
● Inputs: FTA/G + AST/G (pressure + creation output)
● Score: 0.60*Band(FTA/G) + 0.40*Band(AST/G)
2) Passing Vision
Synergy / PlayVision (TRUE)
● Counts: attempts of high-value reads (skip, tag-reader, low-man hit, early-window
passes) regardless of completion
● Inputs: Correct-Read Rate ; High-Value Pass Attempts / G

● Tags: read type (skip/corner/roll/pocket/throwback), coverage faced, help source,
window timing (early/late), intended target advantage
College bands (v0)
● 90: elite correct-read + 8.0+ HV attempts/G
● 80: 6.0–7.9
● 70: 4.5–5.9
● 60: 3.0–4.4
● <60: <3.0
Pro bands (v0)
● 90: elite correct-read + 10.0+
● 80: 8.0–9.9
● 70: 6.0–7.9
● 60: 4.0–5.9
● <60: <4.0
Box-score mode
● UNSCORED (null)
3) Passing Execution
Synergy / PlayVision (TRUE)
● Counts: passes that require precision (velocity/location) under pressure; completion
quality matters
● Inputs: On-Target Rate (catchable, in-stride) ; Difficult Pass Volume / G
● Tags: pass difficulty (zip/skip/pocket/one-hand), pressure on passer, receiver advantage
state, catch quality (in-stride/off-line)
College bands (v0)
● 90: elite on-target + 6.0+ difficult/G
● 80: 4.5–5.9
● 70: 3.0–4.4
● 60: 1.8–2.9
● <60: <1.8
Pro bands (v0)
● 90: elite on-target + 7.0+

● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Box-score mode
● PROXY
● Inputs: AST/TO ratio + AST/G
● Score: 0.60*Band(AST/TO) + 0.40*Band(AST/G)
4) Advantage Passing
Synergy / PlayVision (TRUE)
● Counts: passes made after creating advantage (drive-and-kick, PnR reads,
paint-touch passes) that create shots
● Inputs: Advantage Assist Rate (assists + “created shots” from advantage passes) ;
Advantage Passes / G
● Tags: drive kick, paint touch pass, PnR pocket/skip, short-roll feed, help tag exploited,
corner lift hit
College bands (v0)
● 90: elite creation + 7.0+ advantage passes/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.5–3.9
● <60: <2.5
Pro bands (v0)
● 90: 9.0+
● 80: 7.0–8.9
● 70: 5.0–6.9
● 60: 3.0–4.9
● <60: <3.0
Box-score mode
● PROXY
● Inputs: AST/G + TO/G (inverse)
● Score: 0.70*Band(AST/G) + 0.30*Band(InvTO/G)

5) Transition Playmaking
Synergy / PlayVision (TRUE)
● Counts: transition possessions where player creates advantage as advance passer /
hit-ahead / transition handler
● Inputs: Transition Assists+Creates / G ; Transition Playmaking Rate (per transition
touch)
● Tags: hit-ahead, advance pass, push dribble, early drag screen read, numbers
advantage
College bands (v0)
● 90: 2.5+ transition creates/G
● 80: 1.8–2.4
● 70: 1.2–1.7
● 60: 0.6–1.1
● <60: <0.6
Pro bands (v0)
● 90: 3.0+
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Box-score mode
● UNSCORED (null)
6) Ball Security
Synergy / PlayVision (TRUE)
● Counts: possessions with live dribble pressure; focuses on mishandles/strips not bad
reads
● Inputs: Handle TO Rate (mishandle/strip per touch) ; Pressure Touch Volume / G
● Tags: strip, handle lost, dribble off-foot, trapped, pressure level, pickup forced
College bands (v0)

● 90: very low handle-TO rate on high pressure volume
● 80: low
● 70: average
● 60: shaky
● <60: liability
Pro bands (v0)
● same structure, stricter on TO rate
Box-score mode
● PROXY
● Inputs: TO/G + Usage proxy (FGA+FTA+AST)/G if you have it; otherwise TO/G only
● Score: 0.70*Band(InvTO/G) + 0.30*Band(UsageProxy) (or Band(InvTO/G)
alone)
7) Connector Creation
Synergy / PlayVision (TRUE)
● Counts: advantage created without dribbling: screen assists + hockey assists +
extra-pass leading to rotation/shot
● Inputs: Connector Creates / G (screen assists + hockey assists + “advantage passes”)
; Connector Rate (per touch)
● Tags: screen assist, re-screen, dribble-handoff keep, swing-swing, hockey assist,
extra-pass, 0–1 dribble decision, short-roll quick hit
College bands (v0)
● 90: 3.0+ connector creates/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Pro bands (v0)
● 90: 3.5+
● 80: 2.6–3.4
● 70: 1.8–2.5
● 60: 1.0–1.7
● <60: <1.0

Box-score mode
● UNSCORED (null)
POA Defense Cluster — Locked Traits (7)
1) Containment
Synergy / PlayVision (TRUE)
● Counts: on-ball defensive possessions vs primary handler where defender is the on-ball
assignment
● Inputs: Blow-By Rate (inverse) ; Containment Stops / G (or per 100 on-ball
possessions)
● Tags: on-ball assignment, drive attempt, blow-by, forced pickup, forced retreat, rim line
breach, shot clock, side (L/R)
College bands (v0)
● 90: elite low blow-by on high volume
● 80: strong
● 70: average
● 60: attacked
● <60: liability
Pro bands (v0)
● same structure, stricter blow-by thresholds
Box-score mode
● UNSCORED (null)
2) Screen Navigation
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions where defender must navigate a ball screen (PnR, DHO
chase, off-ball into on-ball)
● Inputs: Screen Win Rate ; Screen Events / G

● Tags: screen type (ball screen/DHO), coverage call, over/under/ice, hit/stuck, recover
time, re-screen, contact level
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: dies on screens
● <60: unplayable vs screening
Pro bands (v0)
● stricter win-rate thresholds
Box-score mode
● UNSCORED (null)
3) Ball Pressure
Synergy / PlayVision (TRUE)
● Counts: on-ball possessions with live dribble where defender applies pressure without
fouling
● Inputs: Forced Pickup Rate ; Pressure Touches / G
● Tags: pressure level, forced pickup, trap, deny dribble, retreat dribble forced, time to
initiate, clock bleed
College bands (v0)
● 90: elite forced pickups/clock burn
● 80: strong
● 70: average
● 60: passive
● <60: no pressure value
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)

4) Closeout & Recovery
Synergy / PlayVision (TRUE)
● Counts: closeouts to perimeter shooters where defender must recover to contest (from
stunt/help or rotation)
● Inputs: Closeout Win Rate ; Closeout Events / G
● Tags: closeout type (short/chop/run), contest class, fly-by, blow-by allowed, recovery
time, shooter type (C&S vs attack)
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: constant fly-bys
● <60: target
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)
5) Deflections
Synergy / PlayVision (TRUE)
● Counts: deflections/disruptions that do not necessarily become steals (tips, pokes,
blown-up passes)
● Inputs: Deflections / G ; Deflections per 100 defensive possessions
● Tags: deflection type (pass tip/ball poke), location, pressure context, outcome (reset/late
clock)
College bands (v0)
● 90: 3.0+ per G (high activity)
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4

● <60: <0.8
Pro bands (v0)
● bump volume up slightly (higher possession quality)
● 90: 3.5+ per G, etc.
Box-score mode
● UNSCORED (null)
6) Steal Timing
Synergy / PlayVision (TRUE)
● Counts: steals from strips + passing lane jumps + digs
● Inputs: Steals / G ; Steals per 100 defensive possessions
● Tags: steal type (strip/lane/dig), gamble vs within-scheme, foul on attempt, result
(runout)
College bands (v0)
● 90: 2.0+ STL/G
● 80: 1.5–1.9
● 70: 1.1–1.4
● 60: 0.6–1.0
● <60: <0.6
Pro bands (v0)
● 90: 1.8+ STL/G (rotation tighter, fewer chances)
● 80: 1.3–1.7
● 70: 0.9–1.2
● 60: 0.5–0.8
● <60: <0.5
Box-score mode
● TRUE
● Inputs: STL/G ; STL per 100 (if possessions available; else STL/G only)
7) Foul Discipline

Synergy / PlayVision (TRUE)
● Counts: on-ball / screen-action fouls: reach, hand-check, shooting foul on closeout, trail
foul
● Inputs: Avoidable POA Fouls / G (inverse) ; POA Foul Rate per 100
● Tags: foul type, context (on-ball/screen/closeout), bailout vs necessary, bonus state
College bands (v0)
● 90: very low avoidable fouls on high pressure
● 80: low
● 70: average
● 60: foul-prone
● <60: liability / constant bonus
Pro bands (v0)
● stricter thresholds
Box-score mode
● PROXY
● Inputs: PF/G (inverse) + STL/G (to normalize aggression)
● Score: 0.70*Band(InvPF/G) + 0.30*Band(STL/G)

Team Defense Cluster — Traits (7)
1) Help & Rotation
Synergy / PlayVision (TRUE)
● Counts: off-ball defensive possessions where player is in help position and must rotate
(tag/low-man/help stunt/x-out)
● Inputs: Rotation Win Rate ; Rotation Events / G
● Tags: help role (low-man/nail/tag), rotation type (tag→recover, x-out, stunt→recover),
timing (early/on-time/late), outcome (stop/advantage allowed)
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: late/slow
● <60: breakdown creator
Pro bands (v0)
● stricter timing/win-rate thresholds
Box-score mode
● UNSCORED (null)
2) Rim Protection
Synergy / PlayVision (TRUE)
● Counts: plays where player is the primary rim protector (at rim contest, help contest,
block, altered)
● Inputs: Rim Contest Win Rate ; Rim Contests / G
● Tags: rim contest, verticality, block, altered, opponent FG at rim against, help vs primary,
foul on contest
College bands (v0)
● 90: elite win rate + 5.0+ rim contests/G
● 80: 3.8–4.9
● 70: 2.6–3.7
● 60: 1.5–2.5

● <60: <1.5
Pro bands (v0)
● 90: elite + 6.0+ rim contests/G
● 80: 4.5–5.9
● 70: 3.2–4.4
● 60: 2.0–3.1
● <60: <2.0
Box-score mode
● PROXY
● Inputs: BLK/G + DRB/G
● Score: 0.60*Band(BLK/G) + 0.40*Band(DRB/G)
3) Closeout Execution
Synergy / PlayVision (TRUE)
● Counts: team-rotation closeouts (you’re closing from help, not POA primary)
● Inputs: Closeout Win Rate ; Team Closeout Events / G
● Tags: closeout type, contest class, blow-by allowed, drive-off-closeout, shot allowed,
recovery time
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: fly-by/drive allowed
● <60: hunted in rotations
Pro bands (v0)
● stricter thresholds
Box-score mode
● UNSCORED (null)
4) Off-Ball Positioning (Denial/Tagging)

Synergy / PlayVision (TRUE)
● Counts: off-ball possessions where player must execute positioning rules (deny,
top-lock, tag roller, low-man)
● Inputs: Assignment Win Rate ; Positioning Events / G
● Tags: denial/top-lock, tag roller, low-man, stunt position, spacing responsibility, missed
tag, late peel switch
College bands (v0)
● 90: elite win rate + high events
● 80: strong
● 70: average
● 60: frequent misses
● <60: constant breakdowns
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
5) Communication & QB
Synergy / PlayVision (TRUE)
● Counts: possessions with called coverages, pre-rotations, and organizer behavior
(directing, early calls)
● Inputs: Call Accuracy Rate ; QB Events / G
● Tags: coverage call, early call vs late, pointing/directing, switch call, scram call, peel call,
miscommunication error
College bands (v0)
● 90: elite call accuracy + high involvement
● 80: strong
● 70: average
● 60: quiet/late
● <60: miscomm errors
Pro bands (v0)

● stricter
Box-score mode
● UNSCORED (null)
6) Versatility (Switch/Guard Up/Down)
Synergy / PlayVision (TRUE)
● Counts: possessions where player defends out of position (switch up/down, guards
multiple types)
● Inputs: Switch Stop Rate ; Switch Possessions / G
● Tags: switch event, matchup type (guard/wing/big), post switched, iso switched, foul on
switch, help needed
College bands (v0)
● 90: elite stop rate on high switch volume
● 80: strong
● 70: average
● 60: targeted on switches
● <60: cannot switch
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
7) Team Foul Discipline
Synergy / PlayVision (TRUE)
● Counts: help/rotation/rim-protection fouls (late help hacks, verticality fouls, tag fouls,
over-the-back)
● Inputs: Avoidable Team Fouls / G (inverse) ; Team Foul Rate per 100
● Tags: foul type, context (help/rim/tag/rebound), bailout vs necessary, bonus state
College bands (v0)

● 90: very low avoidable fouls on high rotation volume
● 80: low
● 70: average
● 60: foul prone
● <60: constant bonus
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: PF/G (inverse) + BLK/G (to normalize rim aggression)
● Score: 0.70*Band(InvPF/G) + 0.30*Band(BLK/G)

Rebounding Cluster — Locked Traits (6)
1) Defensive Rebounding
Synergy / PlayVision (TRUE)
● Counts: defensive rebound opportunities where player is on floor
● Inputs: DRB Win Rate (DRB secured / DRB chances) ; Contested DRB / G
● Tags: rebound chance, contested flag, box-out present, location, high-point win, tip vs
secure
College bands (v0)
● 90: elite win rate + 4.0+ contested DRB/G
● 80: 3.0–3.9
● 70: 2.1–2.9
● 60: 1.2–2.0
● <60: <1.2
Pro bands (v0)
● 90: elite + 5.0+ contested DRB/G
● 80: 3.8–4.9
● 70: 2.6–3.7
● 60: 1.6–2.5
● <60: <1.6
Box-score mode
● PROXY
● Inputs: DRB/G + REB/G
● Score: 0.70*Band(DRB/G) + 0.30*Band(REB/G)
2) Offensive Rebounding
Synergy / PlayVision (TRUE)
● Counts: offensive rebound opportunities where player is on floor
● Inputs: ORB Win Rate (ORB secured / ORB chances) ; Contested ORB / G
● Tags: crash attempt, box-out avoided/won, tip vs secure, putback chance, location
College bands (v0)

● 90: elite win rate + 2.2+ contested ORB/G
● 80: 1.6–2.1
● 70: 1.1–1.5
● 60: 0.6–1.0
● <60: <0.6
Pro bands (v0)
● 90: elite + 2.6+ contested ORB/G
● 80: 1.9–2.5
● 70: 1.3–1.8
● 60: 0.7–1.2
● <60: <0.7
Box-score mode
● PROXY
● Inputs: ORB/G + REB/G
● Score: 0.70*Band(ORB/G) + 0.30*Band(REB/G)
3) Box-Out
Synergy / PlayVision (TRUE)
● Counts: box-out events on shot attempts (defensive + offensive box-outs)
● Inputs: Box-Out Win Rate ; Box-Outs / G
● Tags: box-out initiated, seal held, opponent displaced, team secures rebound, missed
box-out blame
College bands (v0)
● 90: elite win rate + 6.0+ box-outs/G
● 80: 4.8–5.9
● 70: 3.6–4.7
● 60: 2.4–3.5
● <60: <2.4
Pro bands (v0)
● 90: elite + 7.0+ box-outs/G
● 80: 5.5–6.9
● 70: 4.0–5.4
● 60: 2.6–3.9
● <60: <2.6

Box-score mode
● UNSCORED (null)
4) Rebound Range
Synergy / PlayVision (TRUE)
● Counts: rebounds secured outside immediate area (long rebounds, outside paint, to
corners/slots)
● Inputs: Out-of-Area Rebounds / G ; Range Win Rate (won long rebound chances)
● Tags: distance traveled, rebound location, long rebound flag, opponent proximity,
sprint/pursuit
College bands (v0)
● 90: 3.0+ out-of-area/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Pro bands (v0)
● 90: 3.5+
● 80: 2.6–3.4
● 70: 1.8–2.5
● 60: 1.0–1.7
● <60: <1.0
Box-score mode
● UNSCORED (null)
5) Hands (Secure/High-Point)
Synergy / PlayVision (TRUE)
● Counts: rebound attempts where player gets two hands / secures vs bobbles/tips
● Inputs: Secure Rate (secured / contested chances) ; High-Point Wins / G
● Tags: bobble, tip, two-hand secure, one-hand, high-point, traffic, contact

College bands (v0)
● 90: elite secure + 3.0+ high-point wins/G
● 80: 2.2–2.9
● 70: 1.6–2.1
● 60: 0.9–1.5
● <60: <0.9
Pro bands (v0)
● 90: elite + 3.5+
● 80: 2.6–3.4
● 70: 1.9–2.5
● 60: 1.1–1.8
● <60: <1.1
Box-score mode
● PROXY
● Inputs: REB/G (weak proxy)
● Score: Band(REB/G) (low confidence)
6) Second-Jump / Tip Ability
Synergy / PlayVision (TRUE)
● Counts: second-effort rebound plays (tips to self/teammate, pogo repeats, multiple
jumps)
● Inputs: Tip Creates / G (tips that create possession/shot) ; Second-Effort Win Rate
● Tags: tip-out, tip-to-self, pogo repeat, putback off tip, time between jumps
College bands (v0)
● 90: 1.6+ tip creates/G
● 80: 1.1–1.5
● 70: 0.7–1.0
● 60: 0.3–0.6
● <60: <0.3
Pro bands (v0)
● 90: 1.8+
● 80: 1.3–1.7
● 70: 0.8–1.2

● 60: 0.4–0.7
● <60: <0.4
Box-score mode
● UNSCORED (null)

Tools Cluster — Locked Traits (8)
1) Height
Synergy / PlayVision (TRUE)
● Counts: measured player height (no event filter)
● Inputs: Height (inches) ; — (no volume input needed)
● Tags: verified source tier (official / measured / listed)
College bands (v0) (position-agnostic; later we can make position-aware)
● 90: 6'10"+
● 80: 6'7"–6'9"
● 70: 6'4"–6'6"
● 60: 6'1"–6'3"
● <60: under 6'1"
Pro bands (v0)
● 90: 6'11"+
● 80: 6'8"–6'10"
● 70: 6'5"–6'7"
● 60: 6'2"–6'4"
● <60: under 6'2"
Box-score mode
● TRUE (from roster bio)
2) Length
Synergy / PlayVision (TRUE)
● Counts: wingspan / standing reach proxy
● Inputs: Wingspan (inches) ; —
● Tags: wingspan verified (measured/listed), standing reach if available
College bands (v0)
● 90: 7'2"+ wingspan
● 80: 7'0"–7'1"
● 70: 6'9"–6'11"
● 60: 6'6"–6'8"

● <60: under 6'6"
Pro bands (v0)
● 90: 7'4"+
● 80: 7'1"–7'3"
● 70: 6'10"–7'0"
● 60: 6'7"–6'9"
● <60: under 6'7"
Box-score mode
● TRUE if available, else UNSCORED
3) Strength
Synergy / PlayVision (TRUE)
● Counts: physical holds vs dislodged outcomes in contact events
● Inputs: Strength Win Rate ; Strength Events / G
● Tags: post hold, drive contact, screen setting, screen absorption, box-out hold,
displacement
College bands (v0)
● 90: elite win rate on high events
● 80: strong
● 70: average
● 60: gets dislodged
● <60: physical liability
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: weight (if available) + ORB/G + FTA/G (contact proxy)
● Score: 0.40*Band(Weight) + 0.30*Band(ORB/G) + 0.30*Band(FTA/G)
4) Speed

Synergy / PlayVision (TRUE)
● Counts: sprint events (transition offense/defense)
● Inputs: Top Sprint Speed ; Speed Events / G
● Tags: end-to-end sprint, chase-down, rim-run, leakout, recovery sprint
College bands (v0)
● 90: elite top speed on high events
● 80: fast
● 70: average
● 60: slow
● <60: plodding
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)
5) Lateral Quickness
Synergy / PlayVision (TRUE)
● Counts: lateral containment/cutoff events
● Inputs: Lateral Win Rate ; Lateral Events / G
● Tags: slide stay-in-front, cutoff, hip turn recovery, close space, mirror dribble
College bands (v0)
● 90: elite
● 80: strong
● 70: average
● 60: slow feet
● <60: target
Pro bands (v0)
● stricter
Box-score mode
● UNSCORED (null)

6) Vertical Pop
Synergy / PlayVision (TRUE)
● Counts: above-rim plays (dunks, blocks at apex, high-point rebounds)
● Inputs: Above-Rim Wins / G ; Vertical Win Rate
● Tags: dunk, lob finish, block, high-point rebound, contest at apex
College bands (v0)
● 90: elite above-rim wins (2.5+/G)
● 80: 1.8–2.4
● 70: 1.2–1.7
● 60: 0.6–1.1
● <60: <0.6
Pro bands (v0)
● 90: 3.0+/G
● 80: 2.2–2.9
● 70: 1.5–2.1
● 60: 0.8–1.4
● <60: <0.8
Box-score mode
● PROXY
● Inputs: BLK/G + DUNK proxy (if dunk stats available; usually not)
● If no dunk stat: Band(BLK/G) only (low confidence)
7) Motor
Synergy / PlayVision (TRUE)
● Counts: high-activity events independent of minutes
● Inputs: Activity Events / Minute ; Sprint/Re-engage Events / G
● Tags: multiple efforts same possession, crash+recover, screen+rescreen,
closeout+second closeout, chase+recover, loose-ball pursuit
College bands (v0)
● 90: elite activity/min

● 80: high
● 70: average
● 60: low
● <60: poor
Pro bands (v0)
● stricter
Box-score mode
● PROXY
● Inputs: STL/G + ORB/G + BLK/G (stocks/activity proxy)
● Score: 0.40*Band(STL/G) + 0.30*Band(ORB/G) + 0.30*Band(BLK/G)
8) Endurance
Synergy / PlayVision (TRUE)
● Counts: performance drop-off across stints (late-game, 2nd stint, back-to-back high
load)
● Inputs: Late-Stint Dropoff (inverse) ; High-Load Minutes / G
● Tags: pace drop, defensive effort drop, missed rotations late, late closeouts, late fouls,
fatigue indicators
College bands (v0)
● 90: minimal dropoff at 32+ MPG
● 80: minimal at 28–31
● 70: ok at 24–27
● 60: fades at 20–23
● <60: cannot sustain
Pro bands (v0)
● stricter and higher MPG expectations
Box-score mode
● PROXY
● Inputs: MPG (banded) + foul rate late (if not available, MPG only)
● Score: Band(MPG) (low confidence)

IQ Cluster — Locked Traits (6)
1) Decision Speed
Definition: How fast the player makes the correct action after a defined decision trigger.
Counts: All tagged decision triggers where a “correct action” is defined (catch, paint touch, PnR
read, closeout catch, post touch).
Inputs (Primary — locked):
● Median Decision Time (seconds)
● Decision Events / G
Event Tagging Fields:
● trigger_type (catch / paint_touch / PnR_read / closeout_catch / post_touch)
● t0 (trigger timestamp)
● t_action (timestamp of chosen action)
● chosen_action (shoot / drive / pass / hold)
● correct_action (label)
● correctness (0/1)
● pressure_level (none / light / heavy) (for evidence only)
College bands (v0):
● 90: median ≤ 0.60s & 8.0+ events/G
● 80: ≤ 0.80s & 6.0–7.9
● 70: ≤ 1.00s & 4.0–5.9
● 60: ≤ 1.20s & 2.5–3.9
● <60: > 1.20s or low volume
Pro bands (v0):
● 90: ≤ 0.50s & 10.0+
● 80: ≤ 0.70s & 8.0–9.9
● 70: ≤ 0.90s & 6.0–7.9
● 60: ≤ 1.10s & 4.0–5.9
● <60: > 1.10s or low volume
Math:
● speed_band = Band(InvMedianDecisionTime)
● vol_band = Band(DecisionEvents/G)
● Score = round(0.70*speed_band + 0.30*vol_band)

2) Correct Read Rate
Definition: % of defined decision points where the player chooses the correct option.
Counts: All tagged decision points with a defined “correct” read.
Inputs (Primary — locked):
● Correct Read %
● Decision Points / G
Event Tagging Fields:
● decision_point_type (PnR / closeout / paint_touch / post / transition / DHO)
● correct_action label
● chosen_action label
● correctness (0/1)
● window_timing (early/on-time/late) (evidence)
College bands (v0):
● 90: 82%+ & 8.0+ points/G
● 80: 75–81% & 6.0–7.9
● 70: 68–74% & 4.0–5.9
● 60: 60–67% & 2.5–3.9
● <60: < 60% or low volume
Pro bands (v0):
● 90: 85%+ & 10.0+
● 80: 78–84% & 8.0–9.9
● 70: 70–77% & 6.0–7.9
● 60: 62–69% & 4.0–5.9
● <60: < 62% or low volume
Math:
● pct_band = Band(CorrectRead%)
● vol_band = Band(DecisionPoints/G)
● Score = round(0.70*pct_band + 0.30*vol_band)

3) Shot Selection Quality
Definition: Takes good shots, avoids bad shots, relative to context.
Counts: All shot attempts (2PA + 3PA) tagged with shot-quality class.
Inputs (Primary — locked):
● Bad Shot Rate (inverse)
● Bad Shots / G
Event Tagging Fields:
● shot_quality_class (good/ok/bad)
● clock_band (early/mid/late)
● contest_class
● location_band
● creation_type (spot/movement/pull-up/post/PnR)
● advantage_state (yes/no)
College bands (v0): (Bad Shot Rate = bad_shots / total_shots)
● 90: ≤ 8% bad & ≤ 1.0 bad/G
● 80: 9–12% & 1.1–1.6
● 70: 13–16% & 1.7–2.2
● 60: 17–22% & 2.3–3.0
● <60: >22% or >3.0 bad/G
Pro bands (v0):
● 90: ≤ 7% & ≤ 1.0
● 80: 8–11% & 1.1–1.7
● 70: 12–15% & 1.8–2.4
● 60: 16–20% & 2.5–3.2
● <60: >20% or >3.2
Math:
● rate_band = Band(InvBadShotRate)
● vol_band = Band(InvBadShots/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

4) Turnover Decision Quality
Definition: Separates “bad decision” turnovers from forced/execution turnovers.
Counts: All turnovers with cause code.
Inputs (Primary — locked):
● Bad-Decision TO Rate (inverse)
● Bad-Decision TO / G
Event Tagging Fields:
● to_cause (bad_read / forced / mishandle_strip / offensive_foul / travel / out_of_bounds)
● pressure_level
● advantage_state
● decision_point_type (if applicable)
College bands (v0):
● 90: bad-decision TO ≤ 0.25/G and ≤ 20% of TOs
● 80: ≤ 0.45/G and ≤ 30%
● 70: ≤ 0.70/G and ≤ 40%
● 60: ≤ 1.00/G and ≤ 55%
● <60: worse than above
Pro bands (v0):
● 90: ≤ 0.20/G and ≤ 18%
● 80: ≤ 0.40/G and ≤ 28%
● 70: ≤ 0.65/G and ≤ 38%
● 60: ≤ 0.95/G and ≤ 52%
● <60: worse than above
Math:
● rate_band = Band(InvBadDecisionTOShare)
● vol_band = Band(InvBadDecisionTO/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

5) Advantage Conversion
Definition: When advantage is created, how often it converts to a good outcome.
Counts: All tagged advantage events (help committed, rotation triggered, blow-by, paint touch
with collapse).
Inputs (Primary — locked):
● Advantage Conversion %
● Advantage Conversions / G
Event Tagging Fields:
● advantage_event_type
● help_committed (0/1)
● rotation_triggered (0/1)
● outcome_class (good_shot / paint_touch / foul / assist / turnover / reset)
● window_timing (early/on-time/late)
College bands (v0):
● 90: 65%+ conversion & 4.0+ conv/G
● 80: 58–64% & 3.0–3.9
● 70: 50–57% & 2.0–2.9
● 60: 42–49% & 1.2–1.9
● <60: < 42% or low volume
Pro bands (v0):
● 90: 68%+ & 5.0+
● 80: 60–67% & 3.8–4.9
● 70: 52–59% & 2.6–3.7
● 60: 44–51% & 1.6–2.5
● <60: < 44% or low volume
Math:
● pct_band = Band(AdvConv%)
● vol_band = Band(AdvConversions/G)
● Score = round(0.60*pct_band + 0.40*vol_band)

6) Role Discipline
Definition: Stays inside role constraints (shot profile, tempo rules, read rules, no “hijack”
possessions).
Counts: All “role check” events (shot attempts + decision points) evaluated against role ruleset.
Inputs (Primary — locked):
● Role Violation Rate (inverse)
● Role Violations / G
Event Tagging Fields:
● role_ruleset_version (coach-defined)
● violation_type (bad_shot_in_role / missed_read / early_pull / hero_possession /
ignored_spacing_rule / freelanced_action)
● severity (minor/major)
● clock_band
College bands (v0):
● 90: ≤ 0.40 violations/G and ≤ 6% violation rate
● 80: ≤ 0.70/G and ≤ 10%
● 70: ≤ 1.10/G and ≤ 14%
● 60: ≤ 1.70/G and ≤ 20%
● <60: worse than above
Pro bands (v0):
● 90: ≤ 0.35/G and ≤ 5%
● 80: ≤ 0.65/G and ≤ 9%
● 70: ≤ 1.05/G and ≤ 13%
● 60: ≤ 1.60/G and ≤ 18%
● <60: worse than above
Math:
● rate_band = Band(InvViolationRate)
● vol_band = Band(InvViolations/G)
● Score = round(0.70*rate_band + 0.30*vol_band)

7) Processing Under Pressure
Definition: Decision quality specifically when pressured (traps, tight closeouts, crowded paint).
Counts: All decision points tagged with pressure_level ≥ “heavy”.
Inputs (Primary — locked):
● Pressure Correct Read %
● Pressure Decision Points / G
Event Tagging Fields:
● pressure_level (light/heavy)
● pressure_type (trap/closeout/crowd/dig)
● correctness
● time_to_action
● outcome_class (good/bad/reset/turnover)
College bands (v0):
● 90: 78%+ & 4.0+ pressure points/G
● 80: 70–77% & 3.0–3.9
● 70: 62–69% & 2.0–2.9
● 60: 54–61% & 1.2–1.9
● <60: < 54% or low volume
Pro bands (v0):
● 90: 80%+ & 5.0+
● 80: 72–79% & 3.8–4.9
● 70: 64–71% & 2.6–3.7
● 60: 56–63% & 1.6–2.5
● <60: < 56% or low volume
Math:
● pct_band = Band(PressureCorrectRead%)
● vol_band = Band(PressureDecisionPoints/G)
● Score = round(0.70*pct_band + 0.30*vol_band)
Box-score mode: IQ cluster = UNSCORED (null) for all 7 (by design).



# ARCHETYPE LIBRARY

Archetype Library

ARCHETYPE LIBRARY v2 — NUMERIC
GATE RULES (College v1)
Global assignment rules (once)
Use these once at the top.
Primary archetype assignment
● Relevant Skill KR must clear the archetype floor.
● All primary traits must clear their gate.
● If support traits are listed, at least one support trait must clear its gate unless explicitly
stated otherwise.
● Required traits must be scored (non-null) in the active data layer.
Default floor by archetype type
● Engine / creator archetypes: relevant Skill KR ≥ 80
● Shooting / finishing / big-offense role archetypes: relevant Skill KR ≥ 78
● Defensive identity archetypes: relevant Skill KR ≥ 80
● Developmental Prospect: no strict Skill KR floor; this is the exception archetype
Secondary archetype assignment
● Same logic, but you may relax the relevant Skill KR floor by −5 if you want secondary
labels.
Non-Box-Score rule
● If an archetype depends on traits that are UNSCORED in box-score, it can only be
assigned in a non-box-score layer.
A) Engines + Connectors
1) Pick-and-Roll Operator
● Relevant Skill KR: Playmaking KR ≥ 80
● Primary traits:
○ Advantage Creation ≥ 80

○ Passing Vision ≥ 78
○ Passing Execution ≥ 78
● Support traits:
○ Ball Security ≥ 72
○ Decision Speed ≥ 70
● Non-box-score note: stronger with tagged reads, but box-score can still proxy parts of it.
2) Primary Ball-Handler (Offense-First)
● Relevant Skill KR: Playmaking KR ≥ 82
● Primary traits:
○ Advantage Creation ≥ 82
○ Ball Security ≥ 75
○ Passing Execution ≥ 75
● Support traits:
○ Passing Vision ≥ 72
○ 3PT Pull-Up ≥ 70 or Rim Pressure ≥ 72
● This is your high-usage engine label.
3) Secondary Creator Wing
● Relevant Skill KR: Playmaking KR ≥ 78
● Primary traits:
○ Advantage Creation ≥ 78
○ 3PT Pull-Up ≥ 72
● Support traits:
○ Rim Pressure ≥ 72
○ Passing Execution ≥ 70
4) Connector Guard / Wing
● Relevant Skill KR: Playmaking KR ≥ 76
● Primary traits:
○ Connector Creation ≥ 80
○ Passing Execution ≥ 75
● Support traits:
○ Decision Speed ≥ 75
○ Ball Security ≥ 72
○ Role Discipline ≥ 72
● This matches your “decision-speed connectors” language in Read & React.
5) DHO / Handoff Hub
● Relevant Skill KR: Playmaking KR ≥ 76

● Primary traits:
○ Passing Execution ≥ 75
○ Connector Creation ≥ 75
● Support traits:
○ Screen Navigation / screening-adjacent tagged input if you track it, otherwise
○ Decision Speed ≥ 72
○ Touch / Craft ≥ 70
● Non-box-score dependent if you want true handoff tagging.
6) Point Forward
● Relevant Skill KR: Playmaking KR ≥ 78
● Primary traits:
○ Advantage Creation ≥ 75
○ Passing Vision ≥ 75
○ Passing Execution ≥ 75
● Tools gate:
○ Height ≥ wing/forward band (use your roster field)
● Support traits:
○ Ball Security ≥ 70
7) Situational Ball-Handler (Bench Guard)
● Relevant Skill KR: Playmaking KR ≥ 72
● Primary traits:
○ Passing Execution ≥ 72
○ Ball Security ≥ 70
● Support traits:
○ Advantage Creation ≥ 68
○ Decision Speed ≥ 68
● Explicitly below “full engine” thresholds by design.
B) Shooting Archetypes
8) Off-Ball Shooter (Movement)
● Relevant Skill KR: Shooting KR ≥ 78
● Primary traits:
○ 3PT Movement ≥ 80
● Support traits:
○ 3PT Spot-Up ≥ 72
○ Endurance ≥ 70

● Non-box-score dependent if Movement is not scored in box-score. 3PT Movement is a
locked shooting trait.
9) Spot-Up Specialist
● Relevant Skill KR: Shooting KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 80
● Support traits:
○ Free Throw ≥ 70
○ Role Discipline ≥ 68
● 3PT Spot-Up is a locked trait with box-score proxy support.
10) Situational Shooter (Specialist)
● Relevant Skill KR: Shooting KR ≥ 74
● Primary traits:
○ 3PT Spot-Up ≥ 84 or 3PT Movement ≥ 82
● Support traits:
○ Advantage Creation ≤ 65 (optional negative identity gate if you want this to stay
narrow)
● This is the narrow-role sniper label.
C) Rim Pressure / Finishing Roles
11) Slasher / Rim Pressure Wing
● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Rim Pressure ≥ 80
○ Foul Draw ≥ 75
● Support traits:
○ Contact Finishing ≥ 72
○ Transition Finishing ≥ 70
12) Vertical Spacer (Rim Runner)
● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Vertical Finishing ≥ 82
○ Rim Pressure ≥ 75
● Support traits:

○ Transition Finishing ≥ 70
● Tools support:
○ Vertical Pop ≥ 72 if scored
● Non-box-score dependent if Vertical Finishing is not scored in box-score.
D) Big Roles (Spacing / Hub / Scoring)
13) Stretch Big (Pick-and-Pop)
● Relevant Skill KR: Shooting KR ≥ 74
● Primary traits:
○ 3PT Spot-Up ≥ 78
● Support traits:
○ Free Throw ≥ 70
○ Passing Execution ≥ 65
● Tools gate:
○ frontcourt/big height band
● This cleanly maps to the archetype used across multiple systems.
14) Short-Roll Playmaker Big
● Relevant Skill KR: Playmaking KR ≥ 74
● Primary traits:
○ Passing Execution ≥ 78
○ Advantage Passing ≥ 75
● Support traits:
○ Touch / Craft ≥ 72
○ Decision Speed ≥ 70
● Tools gate:
○ big role / frontcourt band
15) Post Hub / Facilitator Big
● Relevant Skill KR: Playmaking KR ≥ 76
● Primary traits:
○ Passing Vision ≥ 78
○ Passing Execution ≥ 78
● Support traits:
○ Touch / Craft ≥ 72
○ Role Discipline ≥ 70
16) Post Scorer (Back-to-Basket)

● Relevant Skill KR: Finishing KR ≥ 78
● Primary traits:
○ Contact Finishing ≥ 80
○ Touch / Craft ≥ 78
● Support traits:
○ Foul Draw ≥ 72
● If you later add dedicated post-play-type tags, this gets even cleaner.
17) Small-Ball Big (Switch 5)
● Relevant Skill KR: Team Defense KR ≥ 78
● Primary traits:
○ Versatility ≥ 80
○ Closeout Execution ≥ 74
● Support traits:
○ Lateral Quickness ≥ 74
○ Rim Protection ≥ 68
● Non-box-score dependent unless your layer scores Versatility.
18) Offensive Big (Defense Liability)
● Relevant Skill KR:
○ Offensive Skill KR (Shooting or Finishing or Playmaking) ≥ 76
● Offensive primary traits: at least one of:
○ 3PT Spot-Up ≥ 75
○ Contact Finishing ≥ 75
○ Passing Execution ≥ 75
● Defensive liability gate: at least one of:
○ Containment ≤ 60
○ Versatility ≤ 60
○ Rim Protection ≤ 60
● This is one of the few archetypes that intentionally uses a negative defensive condition.
E) Defensive Identity Archetypes
19) POA Defender Guard
● Relevant Skill KR: POA Defense KR ≥ 80
● Primary traits:
○ Containment ≥ 80
○ Screen Navigation ≥ 78
○ Ball Pressure ≥ 75

● Support traits:
○ Foul Discipline ≥ 70
20) Switchable Defender Wing
● Relevant Skill KR: Team Defense KR ≥ 80
● Primary traits:
○ Versatility ≥ 80
○ Closeout Execution ≥ 75
● Support traits:
○ Containment ≥ 70
○ Lateral Quickness ≥ 72
● This aligns with your switchability language and Versatility trait.
21) Rim Protector Anchor
● Relevant Skill KR: Team Defense KR ≥ 82
● Primary traits:
○ Rim Protection ≥ 82
○ Help & Rotation ≥ 75
● Support traits:
○ Communication & QB ≥ 70
○ Defensive Rebounding ≥ 72
22) Rebounding / Interior Enforcer
● Relevant Skill KR: Rebounding KR ≥ 80
● Primary traits:
○ Defensive Rebounding ≥ 80
○ Box-Out ≥ 78
● Support traits:
○ Hands ≥ 72
○ Offensive Rebounding ≥ 68
23) Two-Way Wing
● Relevant Skill KR:
○ Shooting KR ≥ 74
○ Team Defense KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 75
○ Versatility ≥ 75
● Support traits:
○ Closeout Execution ≥ 70

○ Rim Pressure ≥ 68 or Advantage Creation ≥ 68
● This is the broadest real-value wing archetype.
24) 3-and-D Wing
● Relevant Skill KR:
○ Shooting KR ≥ 76
○ Team Defense KR ≥ 76
● Primary traits:
○ 3PT Spot-Up ≥ 80
○ Versatility ≥ 72
● Support traits:
○ Closeout Execution ≥ 70
○ Role Discipline ≥ 70
● This one should be narrower and cleaner than Two-Way Wing.
25) Energy Bench Spark
● Relevant Skill KR: no single strict floor; use mixed identity
● Primary traits:
○ Motor ≥ 80
○ Endurance ≥ 75
● Support traits:
○ Ball Pressure ≥ 70 or Deflections ≥ 70
○ Transition Finishing ≥ 68
● This is intentionally chaos/tempo, not polished star skill.
F) Development
26) Developmental Prospect
● No hard Skill KR floor
● Primary traits:
○ at least two of the following ≥ 75
■ Height / Length / Speed / Lateral Quickness / Vertical Pop
● Production check:
○ at least one major offensive or defensive Skill KR below 72
● This is the “tools flash, inconsistent production” exception label, exactly matching your
definition.

Position Weighting

POINT GUARD (PG) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OKR — OFFENSE KR (100%)
Shooting — 34%
3PT Spot-Up: 8%
3PT Movement: 6%
3PT Pull-Up: 12%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 22%
Rim Pressure: 6%
Contact Finishing: 4%
Touch / Craft: 4%
Foul Draw: 4%
Vertical Finishing: 1%
Transition Finishing: 3%
Playmaking — 44%
Advantage Creation: 12%
Passing Vision: 7%
Passing Execution: 7%
Advantage Passing: 8%
Transition Playmaking: 4%
Ball Security: 4%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 60%
Containment: 14%
Screen Navigation: 12%
Ball Pressure: 10%
Closeout & Recovery: 8%
Deflections: 6%

Steal Timing: 6%
Foul Discipline: 4%
Team Defense — 25%
Help & Rotation: 6%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 15%
Defensive Rebounding: 5%
Offensive Rebounding: 2%
Box-Out: 3%
Rebound Range: 2%
Hands: 2%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 6%
Length: 8%
Strength: 10%
Speed: 18%
Lateral Quickness: 22%
Vertical Pop: 8%
Motor: 18%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 15%
Role Discipline: 20%
Processing Under Pressure: 20%

POINT GUARD (PG) — PRO
OPF — Overall Position Framework
Offense (OKR): 58%
Defense (DKR): 28%
Tools (TKR): 5%
IQ (IQKR): 9%
OKR — OFFENSE KR (100%)
Shooting — 36%
3PT Spot-Up: 9%
3PT Movement: 7%
3PT Pull-Up: 12%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 20%
Rim Pressure: 5%
Contact Finishing: 4%
Touch / Craft: 4%
Foul Draw: 4%
Vertical Finishing: 1%
Transition Finishing: 2%
Playmaking — 44%
Advantage Creation: 12%
Passing Vision: 7%
Passing Execution: 7%
Advantage Passing: 8%
Transition Playmaking: 4%
Ball Security: 4%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 62%
Containment: 14%
Screen Navigation: 13%
Ball Pressure: 10%
Closeout & Recovery: 9%
Deflections: 6%
Steal Timing: 6%
Foul Discipline: 4%

Team Defense — 23%
Help & Rotation: 5%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 3%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 15%
Defensive Rebounding: 5%
Offensive Rebounding: 2%
Box-Out: 3%
Rebound Range: 2%
Hands: 2%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 4%
Length: 6%
Strength: 8%
Speed: 22%
Lateral Quickness: 24%
Vertical Pop: 8%
Motor: 14%
Endurance: 14%
IQKR — IQ KR (100%)
Decision Speed: 18%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 14%
Role Discipline: 20%
Processing Under Pressure: 20%

SHOOTING GUARD (SG) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 44%
3PT Spot-Up: 14%
3PT Movement: 10%
3PT Pull-Up: 13%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 1%
Finishing — 26%
Rim Pressure: 7%
Contact Finishing: 5%
Touch / Craft: 4%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 7%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 6%
Transition Playmaking: 3%
Ball Security: 3%
Connector Creation: 1%
DKR — DEFENSE KR (100%)
POA Defense — 55%
Containment: 12%
Screen Navigation: 11%
Ball Pressure: 8%
Closeout & Recovery: 7%
Deflections: 6%
Steal Timing: 7%
Foul Discipline: 4%

Team Defense — 25%
Help & Rotation: 6%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 20%
Defensive Rebounding: 7%
Offensive Rebounding: 3%
Box-Out: 4%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 8%
Length: 10%
Strength: 10%
Speed: 16%
Lateral Quickness: 18%
Vertical Pop: 10%
Motor: 18%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

SHOOTING GUARD (SG) — PRO
OPF — Overall Position Framework
Offense (OKR): 60%
Defense (DKR): 28%
Tools (TKR): 6%
IQ (IQKR): 6%
OKR — OFFENSE KR (100%)
Shooting — 46%
3PT Spot-Up: 15%
3PT Movement: 11%
3PT Pull-Up: 13%
3PT Deep Range: 4%
Midrange Shotmaking: 2%
Free Throw: 1%
Finishing — 24%
Rim Pressure: 6%
Contact Finishing: 5%
Touch / Craft: 4%
Foul Draw: 5%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 7%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 6%
Transition Playmaking: 3%
Ball Security: 3%
Connector Creation: 1%
DKR — DEFENSE KR (100%)
POA Defense — 58%
Containment: 13%
Screen Navigation: 12%
Ball Pressure: 8%
Closeout & Recovery: 8%
Deflections: 6%
Steal Timing: 7%
Foul Discipline: 4%

Team Defense — 24%
Help & Rotation: 5%
Rim Protection: 2%
Closeout Execution: 4%
Off-Ball Positioning (Denial/Tagging): 5%
Communication & QB: 4%
Versatility (Switch/Guard Up/Down): 2%
Team Foul Discipline: 2%
Rebounding — 18%
Defensive Rebounding: 6%
Offensive Rebounding: 3%
Box-Out: 4%
Rebound Range: 1%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 5%
Length: 7%
Strength: 8%
Speed: 18%
Lateral Quickness: 20%
Vertical Pop: 10%
Motor: 16%
Endurance: 16%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

SMALL FORWARD (SF) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 40%
3PT Spot-Up: 14%
3PT Movement: 10%
3PT Pull-Up: 8%
3PT Deep Range: 3%
Midrange Shotmaking: 3%
Free Throw: 2%
Finishing — 32%
Rim Pressure: 10%
Contact Finishing: 7%
Touch / Craft: 5%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 2%
Playmaking — 28%
Advantage Creation: 6%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 5%
Transition Playmaking: 3%
Ball Security: 2%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 40%
Containment: 8%
Screen Navigation: 7%
Ball Pressure: 5%
Closeout & Recovery: 6%
Deflections: 5%
Steal Timing: 6%
Foul Discipline: 3%

Team Defense — 35%
Help & Rotation: 8%
Rim Protection: 6%
Closeout Execution: 5%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 5%
Versatility (Switch/Guard Up/Down): 4%
Team Foul Discipline: 1%
Rebounding — 25%
Defensive Rebounding: 9%
Offensive Rebounding: 4%
Box-Out: 5%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 14%
Length: 16%
Strength: 14%
Speed: 10%
Lateral Quickness: 10%
Vertical Pop: 10%
Motor: 16%
Endurance: 10%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

SMALL FORWARD (SF) — PRO
OPF — Overall Position Framework
Offense (OKR): 54%
Defense (DKR): 32%
Tools (TKR): 7%
IQ (IQKR): 7%
OKR — OFFENSE KR (100%)
Shooting — 42%
3PT Spot-Up: 15%
3PT Movement: 11%
3PT Pull-Up: 9%
3PT Deep Range: 3%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 30%
Rim Pressure: 9%
Contact Finishing: 7%
Touch / Craft: 5%
Foul Draw: 6%
Vertical Finishing: 2%
Transition Finishing: 1%
Playmaking — 28%
Advantage Creation: 6%
Passing Vision: 5%
Passing Execution: 5%
Advantage Passing: 5%
Transition Playmaking: 3%
Ball Security: 2%
Connector Creation: 2%
DKR — DEFENSE KR (100%)
POA Defense — 40%
Containment: 8%
Screen Navigation: 7%
Ball Pressure: 5%
Closeout & Recovery: 6%
Deflections: 5%
Steal Timing: 6%
Foul Discipline: 3%

Team Defense — 36%
Help & Rotation: 8%
Rim Protection: 7%
Closeout Execution: 5%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 5%
Versatility (Switch/Guard Up/Down): 4%
Team Foul Discipline: 1%
Rebounding — 24%
Defensive Rebounding: 8%
Offensive Rebounding: 4%
Box-Out: 5%
Rebound Range: 2%
Hands: 4%
Second-Jump / Tip Ability: 1%
TKR — TOOLS KR (100%)
Height: 10%
Length: 12%
Strength: 10%
Speed: 12%
Lateral Quickness: 12%
Vertical Pop: 12%
Motor: 16%
Endurance: 16%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

POWER FORWARD (PF) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OKR — OFFENSE KR (100%)
Shooting — 26%
3PT Spot-Up: 12%
3PT Movement: 5%
3PT Pull-Up: 3%
3PT Deep Range: 2%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 44%
Rim Pressure: 14%
Contact Finishing: 10%
Touch / Craft: 6%
Foul Draw: 8%
Vertical Finishing: 4%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 5%
Passing Vision: 5%
Passing Execution: 6%
Advantage Passing: 5%
Transition Playmaking: 2%
Ball Security: 2%
Connector Creation: 5%
DKR — DEFENSE KR (100%)
POA Defense — 20%
Containment: 3%
Screen Navigation: 3%
Ball Pressure: 2%
Closeout & Recovery: 4%
Deflections: 3%
Steal Timing: 3%
Foul Discipline: 2%

Team Defense — 45%
Help & Rotation: 10%
Rim Protection: 10%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 5%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 14%
Offensive Rebounding: 6%
Box-Out: 7%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 20%
Length: 18%
Strength: 18%
Speed: 6%
Lateral Quickness: 6%
Vertical Pop: 10%
Motor: 14%
Endurance: 8%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

POWER FORWARD (PF) — PRO
OPF — Overall Position Framework
Offense (OKR): 46%
Defense (DKR): 40%
Tools (TKR): 10%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 28%
3PT Spot-Up: 13%
3PT Movement: 6%
3PT Pull-Up: 3%
3PT Deep Range: 2%
Midrange Shotmaking: 2%
Free Throw: 2%
Finishing — 42%
Rim Pressure: 13%
Contact Finishing: 10%
Touch / Craft: 6%
Foul Draw: 7%
Vertical Finishing: 4%
Transition Finishing: 2%
Playmaking — 30%
Advantage Creation: 5%
Passing Vision: 5%
Passing Execution: 6%
Advantage Passing: 5%
Transition Playmaking: 2%
Ball Security: 2%
Connector Creation: 5%
DKR — DEFENSE KR (100%)
POA Defense — 18%
Containment: 3%
Screen Navigation: 3%
Ball Pressure: 2%
Closeout & Recovery: 3%
Deflections: 3%
Steal Timing: 2%
Foul Discipline: 2%

Team Defense — 47%
Help & Rotation: 10%
Rim Protection: 11%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 6%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 14%
Offensive Rebounding: 6%
Box-Out: 7%
Rebound Range: 3%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 16%
Length: 16%
Strength: 18%
Speed: 6%
Lateral Quickness: 6%
Vertical Pop: 14%
Motor: 12%
Endurance: 12%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

CENTER (C) — COLLEGE
OPF — Overall Position Framework
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OKR — OFFENSE KR (100%)
Shooting — 14%
3PT Spot-Up: 8%
3PT Movement: 2%
3PT Pull-Up: 0%
3PT Deep Range: 1%
Midrange Shotmaking: 1%
Free Throw: 2%
Finishing — 60%
Rim Pressure: 16%
Contact Finishing: 16%
Touch / Craft: 8%
Foul Draw: 10%
Vertical Finishing: 8%
Transition Finishing: 2%
Playmaking — 26%
Advantage Creation: 3%
Passing Vision: 4%
Passing Execution: 6%
Advantage Passing: 4%
Transition Playmaking: 1%
Ball Security: 2%
Connector Creation: 6%
DKR — DEFENSE KR (100%)
POA Defense — 10%
Containment: 1%
Screen Navigation: 2%
Ball Pressure: 0%
Closeout & Recovery: 3%
Deflections: 2%
Steal Timing: 1%
Foul Discipline: 1%

Team Defense — 55%
Help & Rotation: 12%
Rim Protection: 18%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 5%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 16%
Offensive Rebounding: 6%
Box-Out: 6%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 26%
Length: 22%
Strength: 20%
Speed: 4%
Lateral Quickness: 4%
Vertical Pop: 10%
Motor: 8%
Endurance: 6%
IQKR — IQ KR (100%)
Decision Speed: 15%
Correct Read Rate: 15%
Shot Selection Quality: 15%
Turnover Decision Quality: 15%
Advantage Conversion: 10%
Role Discipline: 15%
Processing Under Pressure: 15%

CENTER (C) — PRO
OPF — Overall Position Framework
Offense (OKR): 36%
Defense (DKR): 48%
Tools (TKR): 12%
IQ (IQKR): 4%
OKR — OFFENSE KR (100%)
Shooting — 16%
3PT Spot-Up: 9%
3PT Movement: 2%
3PT Pull-Up: 0%
3PT Deep Range: 2%
Midrange Shotmaking: 1%
Free Throw: 2%
Finishing — 58%
Rim Pressure: 15%
Contact Finishing: 16%
Touch / Craft: 8%
Foul Draw: 10%
Vertical Finishing: 7%
Transition Finishing: 2%
Playmaking — 26%
Advantage Creation: 3%
Passing Vision: 4%
Passing Execution: 6%
Advantage Passing: 4%
Transition Playmaking: 1%
Ball Security: 2%
Connector Creation: 6%
DKR — DEFENSE KR (100%)
POA Defense — 8%
Containment: 1%
Screen Navigation: 2%
Ball Pressure: 0%
Closeout & Recovery: 2%
Deflections: 1%
Steal Timing: 1%
Foul Discipline: 1%

Team Defense — 57%
Help & Rotation: 12%
Rim Protection: 19%
Closeout Execution: 6%
Off-Ball Positioning (Denial/Tagging): 6%
Communication & QB: 6%
Versatility (Switch/Guard Up/Down): 6%
Team Foul Discipline: 2%
Rebounding — 35%
Defensive Rebounding: 16%
Offensive Rebounding: 6%
Box-Out: 6%
Rebound Range: 2%
Hands: 3%
Second-Jump / Tip Ability: 2%
TKR — TOOLS KR (100%)
Height: 22%
Length: 20%
Strength: 20%
Speed: 4%
Lateral Quickness: 4%
Vertical Pop: 14%
Motor: 8%
Endurance: 8%
IQKR — IQ KR (100%)
Decision Speed: 16%
Correct Read Rate: 14%
Shot Selection Quality: 14%
Turnover Decision Quality: 14%
Advantage Conversion: 10%
Role Discipline: 16%
Processing Under Pressure: 16%

System Profiles



# SYSTEM DEMAND PROFILES

OFFENSE — System Demand Profiles (12)
1) Spread Pick-and-Roll
A: Pick-and-Roll Operator; Vertical Spacer (Rim Runner); Spot-Up Specialist (2+)
B: Stretch Big (Pick-and-Pop); Connector Guard / Wing; 3-and-D Wing
C: Secondary Creator Wing; Short-Roll Playmaker Big
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no real PnR engine + no roll/pop gravity = empty possessions and
late-clock pull-ups.
2) 5-Out Motion
A: Connector Guard / Wing; Off-Ball Shooter (Movement); Slasher / Rim Pressure Wing; Stretch
Big (Pick-and-Pop) OR Small-Ball Big (Switch 5)
B: Spot-Up Specialist; Two-Way Wing
C: Secondary Creator Wing; DHO / Handoff Hub
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no connector + no movement gravity = “passing to nowhere,” no
advantage chain.
3) Read & React
A: Connector Guard / Wing; Off-Ball Shooter (Movement); DHO / Handoff Hub; Slasher / Rim
Pressure Wing
B: Secondary Creator Wing; Two-Way Wing; Short-Roll Playmaker Big
C: Spot-Up Specialist; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no decision-speed connectors = turnovers + stalled flow.
4) Pace & Space
A: Primary Ball-Handler (Offense-First) OR Pick-and-Roll Operator; Vertical Spacer (Rim
Runner); Spot-Up Specialist (2+)
B: Slasher / Rim Pressure Wing; 3-and-D Wing; Connector Guard / Wing
C: Stretch Big (Pick-and-Pop); Secondary Creator Wing
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no rim pressure (slasher or rim runner) = “air spacing” with no paint
collapse.

5) Dribble Drive
A: Primary Ball-Handler (Offense-First); Slasher / Rim Pressure Wing (2); Spot-Up Specialist
(2+)
B: Secondary Creator Wing; Vertical Spacer (Rim Runner); Connector Guard / Wing
C: Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: no true slasher pressure + weak spacing = drive lanes die, turnovers
spike.
6) Princeton
A: Post Hub / Facilitator Big OR Point Forward; Connector Guard / Wing; Off-Ball Shooter
(Movement)
B: Slasher / Rim Pressure Wing; Two-Way Wing
C: Spot-Up Specialist; Secondary Creator Wing
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (Post Hub)
Critical-missing risk: no hub passer = perimeter reversals with no trigger.
7) Flex
A: Post Hub / Facilitator Big OR Post Scorer (Back-to-Basket); Spot-Up Specialist (2);
Connector Guard / Wing
B: Off-Ball Shooter (Movement); Slasher / Rim Pressure Wing
C: Secondary Creator Wing; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Specialist Anchor (Post Hub/Scorer); Force Multiplier
Critical-missing risk: no post threat/hub = flex actions don’t force help; you get contested
jumpers.
8) Swing
A: Connector Guard / Wing; Spot-Up Specialist (2+); Secondary Creator Wing
B: Two-Way Wing; Stretch Big (Pick-and-Pop)
C: Slasher / Rim Pressure Wing; DHO / Handoff Hub
Ideal Impact Modifiers: Force Multiplier; Secondary Engine
Critical-missing risk: no secondary creator = ball reversals forever, can’t break set defense.
9) Inside-Out
A: Post Scorer (Back-to-Basket) OR Post Hub / Facilitator Big; Spot-Up Specialist (2+); 3-and-D
Wing

B: Slasher / Rim Pressure Wing; Rebounding / Interior Enforcer
C: Secondary Creator Wing; Stretch Big (Pick-and-Pop)
Ideal Impact Modifiers: Specialist Anchor (post); Force Multiplier
Critical-missing risk: no shooting around post = doubles win; post touches become turnovers.
10) Moreyball
A: Pick-and-Roll Operator; Vertical Spacer (Rim Runner); Spot-Up Specialist (2+); 3-and-D
Wing
B: Stretch Big (Pick-and-Pop); Slasher / Rim Pressure Wing
C: Secondary Creator Wing
Ideal Impact Modifiers: Primary Engine; Force Multiplier
Critical-missing risk: can’t generate rim/3 volume (engine + spacing + rim gravity) = math
advantage disappears.
11) Heliocentric
A: Primary Ball-Handler (Offense-First); Spot-Up Specialist (2+); 3-and-D Wing (2)
B: Vertical Spacer (Rim Runner) OR Stretch Big (Pick-and-Pop); Secondary Creator Wing
C: Connector Guard / Wing
Ideal Impact Modifiers: Primary Engine (mandatory); Force Multiplier
Critical-missing risk: no true engine = system cannot exist; no spacers = engine gets
swarmed.
12) Coach K
Identity: Ultra-fast tempo + constant motion/read-react + Moreyball shot diet (rim + 3s,
especially transition + corners) + Spread PnR embedded (multiple handlers/bigs) + selective iso
inside flow (Heat-style), not heliocentric.
A: Off-Ball Shooter (Movement); Spot-Up Specialist (2+); Pick-and-Roll Operator; Slasher / Rim
Pressure Wing; Vertical Spacer (Rim Runner) OR Stretch Big (Pick-and-Pop)
B: Connector Guard / Wing (2+); Secondary Creator Wing; Short-Roll Playmaker Big
C: DHO / Handoff Hub; Point Forward
Ideal Impact Modifiers: Primary Engine OR Secondary Engine (must have one); Force
Multiplier (2+)
Critical-missing risk: if you don’t have (1) real 3-volume gravity and (2) rim pressure, the pace
becomes empty and you just take bad quick shots; if you don’t have (3) at least one real engine
and (4) connectors, the motion turns into turnovers/forced pull-ups.

DEFENSE — System Demand Profiles (10)
1) Containment
A: Rim Protector Anchor; POA Defender Guard; Switchable Defender Wing
B: Two-Way Wing; Rebounding / Interior Enforcer
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Specialist Anchor (rim); Force Multiplier
Critical-missing risk: no backline rim anchor = blow-bys become layup lines.
2) Pack Line
A: Rim Protector Anchor; Rebounding / Interior Enforcer; Two-Way Wing
B: 3-and-D Wing; POA Defender Guard
C: Switchable Defender Wing
Ideal Impact Modifiers: Specialist Anchor (paint+glass); Force Multiplier
Critical-missing risk: if the anchor can’t protect without fouling OR you can’t rebound, the pack
collapses.
3) Pressure Man
A: POA Defender Guard; Switchable Defender Wing; Energy Bench Spark
B: Rim Protector Anchor; Two-Way Wing
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (stopper)
Critical-missing risk: pressure without backline eraser = constant rim concessions.
4) Switch
A: Switchable Defender Wing (2+); Small-Ball Big (Switch 5); POA Defender Guard
B: Two-Way Wing
C: Rim Protector Anchor (optional)
Ideal Impact Modifiers: Force Multiplier
Critical-missing risk: if your 4/5 can’t survive switches, the identity breaks immediately.
5) No-Middle
A: POA Defender Guard; Rim Protector Anchor; Two-Way Wing
B: 3-and-D Wing; Rebounding / Interior Enforcer
C: Switchable Defender Wing

Ideal Impact Modifiers: Specialist Anchor (rim); Force Multiplier
Critical-missing risk: if POA can’t angle/contain or your low man rotations are weak, the
scheme gets split.
6) Zone
A: Rim Protector Anchor; Rebounding / Interior Enforcer; Two-Way Wing
B: 3-and-D Wing; POA Defender Guard (top pressure)
C: Energy Bench Spark
Ideal Impact Modifiers: Specialist Anchor (rim+glass); Force Multiplier
Critical-missing risk: zone without rebounding dominance = you lose by extra possessions.
7) Matchup Zone
A: Switchable Defender Wing; Two-Way Wing; Rim Protector Anchor
B: POA Defender Guard; Energy Bench Spark
C: Small-Ball Big (Switch 5)
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (matchup stopper)
Critical-missing risk: if wings can’t guard in space, it becomes scramble defense.
8) Full-Court Press
A: Energy Bench Spark; POA Defender Guard; Switchable Defender Wing
B: Rim Protector Anchor; Two-Way Wing
C: Rebounding / Interior Enforcer
Ideal Impact Modifiers: Force Multiplier; Specialist Anchor (backline)
Critical-missing risk: no rim protection behind press = layup drill.
9) Junk
A: Specialist “stopper” (POA Defender Guard OR Switchable Defender Wing); Rim Protector
Anchor
B: Two-Way Wing; 3-and-D Wing
C: Energy Bench Spark
Ideal Impact Modifiers: Specialist Anchor (stopper); Force Multiplier
Critical-missing risk: no true stopper = junk doesn’t steal possessions.

10) Coach K Defense
Identity: Pressure man/denial base + “no-threes” math (run shooters off the line) + funnel drives
into a real rim protector + charges as a weapon; selective 3/4-court pressure (not constant
full-court); occasional change-up zones (1-3-1 / 2-3) and selective switching as disruption, but
man is the identity.
A: POA Defender Guard (2+); Rim Protector Anchor; Switchable Defender Wing (2+); 3-and-D
Wing (2+)
B: Energy Bench Spark; Rebounding / Interior Enforcer; Two-Way Wing
C: Small-Ball Big (Switch 5); Junk / Special stopper variants (as personnel dictates); Matchup
Zone / Hybrid-capable wing
Ideal Impact Modifiers: Specialist Anchor (rim) or Specialist Anchor (stopper); Force Multiplier
(defense playmaking / disruption)
Critical-missing risk: if you can’t (1) deny/contain at the POA to take away threes and (2)
erase the rim behind it (without foul disaster), the whole math identity fails; if you don’t have (3)
multiple switchable wings, pressure turns into matchup hunting.

Offense

SPREAD PICK-AND-ROLL — NEUTRAL (ALL POSITIONS,
COLLEGE)
SPREAD PICK-AND-ROLL — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY (nothing “internal 100%”)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 23.52% TOTAL (56% × 42%)
● 3PT Spot-Up: 3.92% (23.52 × 7/42)
● 3PT Movement: 2.24% (23.52 × 4/42)
● 3PT Pull-Up: 10.08% (23.52 × 18/42)
● 3PT Deep Range: 3.36% (23.52 × 6/42)
● Midrange Shotmaking: 1.68% (23.52 × 3/42)
● Free Throw: 2.24% (23.52 × 4/42)
Finishing: 10.08% TOTAL (56% × 18%)
● Rim Pressure: 3.36% (10.08 × 6/18)
● Contact Finishing: 1.68% (10.08 × 3/18)
● Touch / Craft: 1.12% (10.08 × 2/18)
● Foul Draw: 2.80% (10.08 × 5/18)
● Vertical Finishing: 0.56% (10.08 × 1/18)
● Transition Finishing: 0.56% (10.08 × 1/18)
Playmaking: 22.40% TOTAL (56% × 40%)
● Advantage Creation: 6.72% (22.40 × 12/40)
● Passing Vision: 3.36% (22.40 × 6/40)
● Passing Execution: 3.36% (22.40 × 6/40)
● Advantage Passing: 3.92% (22.40 × 7/40)
● Transition Playmaking: 1.68% (22.40 × 3/40)
● Ball Security: 2.24% (22.40 × 4/40)
● Connector Creation: 1.12% (22.40 × 2/40)

TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.50%
● Motor: 2.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.50%
● Advantage Conversion: 1.50%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-AND-ROLL — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 26.68% (58% × 46%)
● 3PT Spot-Up: 8.12% (26.68 × 14/46)
● 3PT Movement: 4.64% (26.68 × 8/46)
● 3PT Pull-Up: 8.12% (26.68 × 14/46)
● 3PT Deep Range: 2.32% (26.68 × 4/46)
● Midrange Shotmaking: 1.74% (26.68 × 3/46)
● Free Throw: 1.74% (26.68 × 3/46)
Finishing: 10.44% (58% × 18%)
● Rim Pressure: 3.48% (10.44 × 6/18)
● Contact Finishing: 2.32% (10.44 × 4/18)
● Touch / Craft: 1.74% (10.44 × 3/18)
● Foul Draw: 2.32% (10.44 × 4/18)
● Vertical Finishing: 0.58% (10.44 × 1/18)
● Transition Finishing: 0.00% (10.44 × 0/18)
Playmaking: 20.88% (58% × 36%)
● Advantage Creation: 4.64% (20.88 × 8/36)
● Passing Vision: 2.90% (20.88 × 5/36)
● Passing Execution: 2.90% (20.88 × 5/36)
● Advantage Passing: 4.06% (20.88 × 7/36)
● Transition Playmaking: 2.32% (20.88 × 4/36)
● Ball Security: 2.90% (20.88 × 5/36)
● Connector Creation: 1.16% (20.88 × 2/36)
TOOLS (TKR): 12% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.25%
● Motor: 2.75%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL

● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.00%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 22.88% (52% × 44%)
● 3PT Spot-Up: 8.32% (22.88 × 16/44)
● 3PT Movement: 4.68% (22.88 × 9/44)
● 3PT Pull-Up: 5.20% (22.88 × 10/44)
● 3PT Deep Range: 1.56% (22.88 × 3/44)
● Midrange Shotmaking: 1.56% (22.88 × 3/44)
● Free Throw: 1.56% (22.88 × 3/44)
Finishing: 11.44% (52% × 22%)
● Rim Pressure: 4.16% (11.44 × 8/22)
● Contact Finishing: 3.12% (11.44 × 6/22)
● Touch / Craft: 1.56% (11.44 × 3/22)
● Foul Draw: 2.08% (11.44 × 4/22)
● Vertical Finishing: 0.52% (11.44 × 1/22)
● Transition Finishing: 0.00% (11.44 × 0/22)
Playmaking: 17.68% (52% × 34%)
● Advantage Creation: 3.64% (17.68 × 7/34)
● Passing Vision: 2.60% (17.68 × 5/34)
● Passing Execution: 2.60% (17.68 × 5/34)
● Advantage Passing: 3.12% (17.68 × 6/34)
● Transition Playmaking: 1.56% (17.68 × 3/34)
● Ball Security: 2.08% (17.68 × 4/34)
● Connector Creation: 2.08% (17.68 × 4/34)
TOOLS (TKR): 14% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.25%
● Motor: 2.75%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL

● Correct Read Rate: 1.20%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 0.90%
● Role Discipline: 0.70%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — POWER FORWARD (PF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 14.08% (44% × 32%)
● 3PT Spot-Up: 6.16% (14.08 × 14/32)
● 3PT Movement: 2.20% (14.08 × 5/32)
● 3PT Pull-Up: 2.20% (14.08 × 5/32)
● 3PT Deep Range: 0.88% (14.08 × 2/32)
● Midrange Shotmaking: 1.32% (14.08 × 3/32)
● Free Throw: 1.32% (14.08 × 3/32)
Finishing: 16.72% (44% × 38%)
● Rim Pressure: 6.16% (16.72 × 14/38)
● Contact Finishing: 4.40% (16.72 × 10/38)
● Touch / Craft: 2.20% (16.72 × 5/38)
● Foul Draw: 3.08% (16.72 × 7/38)
● Vertical Finishing: 0.88% (16.72 × 2/38)
● Transition Finishing: 0.00% (16.72 × 0/38)
Playmaking: 13.20% (44% × 30%)
● Advantage Creation: 1.76% (13.20 × 4/30)
● Passing Vision: 1.76% (13.20 × 4/30)
● Passing Execution: 2.20% (13.20 × 5/30)
● Advantage Passing: 1.76% (13.20 × 4/30)
● Transition Playmaking: 0.88% (13.20 × 2/30)
● Ball Security: 1.32% (13.20 × 3/30)
● Connector Creation: 3.52% (13.20 × 8/30)
TOOLS (TKR): 18% TOTAL
● Speed: 2.25%
● Vertical Pop: 1.00%
● Motor: 2.75%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL

● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

SPREAD PICK-and-ROLL — CENTER (C)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 6.12% (34% × 18%)
● 3PT Spot-Up: 3.40% (6.12 × 10/18)
● 3PT Movement: 0.68% (6.12 × 2/18)
● 3PT Pull-Up: 0.00% (6.12 × 0/18)
● 3PT Deep Range: 0.68% (6.12 × 2/18)
● Midrange Shotmaking: 0.68% (6.12 × 2/18)
● Free Throw: 0.68% (6.12 × 2/18)
Finishing: 21.08% (34% × 62%)
● Rim Pressure: 5.44% (21.08 × 16/62)
● Contact Finishing: 5.44% (21.08 × 16/62)
● Touch / Craft: 2.72% (21.08 × 8/62)
● Foul Draw: 3.40% (21.08 × 10/62)
● Vertical Finishing: 2.72% (21.08 × 8/62)
● Transition Finishing: 1.36% (21.08 × 4/62)
Playmaking: 6.80% (34% × 20%)
● Advantage Creation: 1.02% (6.80 × 3/20)
● Passing Vision: 1.02% (6.80 × 3/20)
● Passing Execution: 1.36% (6.80 × 4/20)
● Advantage Passing: 1.02% (6.80 × 3/20)
● Transition Playmaking: 0.34% (6.80 × 1/20)
● Ball Security: 0.68% (6.80 × 2/20)
● Connector Creation: 1.36% (6.80 × 4/20)
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.50%
● Motor: 2.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL

● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.50%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — NEUTRAL (ALL POSITIONS, COLLEGE)
5-OUT MOTION — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 21.28% (56% × 38%)
● 3PT Spot-Up: 5.04%
● 3PT Movement: 4.20%
● 3PT Pull-Up: 5.04%
● 3PT Deep Range: 2.52%
● Midrange Shotmaking: 1.68%
● Free Throw: 2.80%
Finishing: 11.20% (56% × 20%)
● Rim Pressure: 3.08%
● Contact Finishing: 1.68%
● Touch / Craft: 2.24%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.40%

Playmaking: 23.52% (56% × 42%)
● Advantage Creation: 5.60%
● Passing Vision: 3.36%
● Passing Execution: 3.36%
● Advantage Passing: 4.20%
● Transition Playmaking: 2.24%
● Ball Security: 2.80%
● Connector Creation: 1.96%
TOOLS (TKR): 10% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.00%
● Motor: 3.00%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.50%
● Role Discipline: 1.20%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 25.52% (58% × 44%)
● 3PT Spot-Up: 6.96%
● 3PT Movement: 5.22%
● 3PT Pull-Up: 7.54%
● 3PT Deep Range: 2.32%
● Midrange Shotmaking: 1.74%
● Free Throw: 1.74%
Finishing: 15.08% (58% × 26%)
● Rim Pressure: 4.06%
● Contact Finishing: 2.90%
● Touch / Craft: 2.32%
● Foul Draw: 3.48%
● Vertical Finishing: 1.16%
● Transition Finishing: 1.16%

Playmaking: 17.40% (58% × 30%)
● Advantage Creation: 4.06%
● Passing Vision: 2.90%
● Passing Execution: 2.90%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.74%
● Ball Security: 1.74%
● Connector Creation: 0.58%
TOOLS (TKR): 12% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.20%
● Motor: 3.60%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

5-OUT MOTION — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 20.80% (52% × 40%)
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.20%
● 3PT Pull-Up: 4.16%
● 3PT Deep Range: 1.56%
● Midrange Shotmaking: 1.56%
● Free Throw: 1.04%
Finishing: 16.64% (52% × 32%)
● Rim Pressure: 5.20%
● Contact Finishing: 3.64%
● Touch / Craft: 2.60%
● Foul Draw: 3.12%
● Vertical Finishing: 1.04%
● Transition Finishing: 1.04%
Playmaking: 14.56% (52% × 28%)

● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 2.60%
● Transition Playmaking: 1.56%
● Ball Security: 1.04%
● Connector Creation: 1.04%
TOOLS (TKR): 14% TOTAL
● Speed: 4.90%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)
5-OUT MOTION — POWER FORWARD (PF)

TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 11.44% (44% × 26%)
● 3PT Spot-Up: 5.28%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.88%
● Free Throw: 0.88%
Finishing: 19.36% (44% × 44%)
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%
Playmaking: 13.20% (44% × 30%)

● Advantage Creation: 2.20%
● Passing Vision: 2.20%
● Passing Execution: 2.64%
● Advantage Passing: 2.20%
● Transition Playmaking: 0.88%
● Ball Security: 0.88%
● Connector Creation: 2.20%
TOOLS (TKR): 18% TOTAL
● Speed: 6.30%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 4.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)
5-OUT MOTION — CENTER (C)

TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 4.76% (34% × 14%)
● 3PT Spot-Up: 2.72%
● 3PT Movement: 0.68%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.68%
Finishing: 20.40% (34% × 60%)
● Rim Pressure: 5.44%
● Contact Finishing: 5.44%
● Touch / Craft: 2.72%
● Foul Draw: 3.40%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%
Playmaking: 8.84% (34% × 26%)

● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.34%
● Ball Security: 0.68%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 7.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 5.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

READ & REACT — NEUTRAL (ALL POSITIONS, COLLEGE)
READ & REACT — POINT GUARD (PG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 17.92%
● 3PT Spot-Up: 4.03%
● 3PT Movement: 3.58%
● 3PT Pull-Up: 4.03%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.34%
● Free Throw: 3.13%
Finishing: 11.20%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 2.24%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.68%

Playmaking: 26.88%
● Advantage Creation: 7.06%
● Passing Vision: 3.76%
● Passing Execution: 3.76%
● Advantage Passing: 4.71%
● Transition Playmaking: 2.82%
● Ball Security: 2.82%
● Connector Creation: 1.95%
TOOLS (TKR): 10% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.00%
● Motor: 3.00%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.50%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

READ & REACT — SHOOTING GUARD (SG)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 22.04%
● 3PT Spot-Up: 8.12%
● 3PT Movement: 6.96%
● 3PT Pull-Up: 4.06%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 0.58%
Finishing: 12.76%
● Rim Pressure: 4.06%
● Contact Finishing: 2.90%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 0.58%

Playmaking: 23.20%
● Advantage Creation: 5.22%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 4.06%
● Transition Playmaking: 2.90%
● Ball Security: 2.32%
● Connector Creation: 1.74%
TOOLS (TKR): 12% TOTAL
● Speed: 3.60%
● Vertical Pop: 1.20%
● Motor: 3.60%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

READ & REACT — SMALL FORWARD (SF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 17.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.20%
● 3PT Pull-Up: 3.12%
● 3PT Deep Range: 1.04%
● Midrange Shotmaking: 0.52%
● Free Throw: 0.52%
Finishing: 15.60%
● Rim Pressure: 5.20%
● Contact Finishing: 3.64%
● Touch / Craft: 2.60%
● Foul Draw: 2.60%
● Vertical Finishing: 0.52%
● Transition Finishing: 1.04%

Playmaking: 18.72%
● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 3.12%
● Transition Playmaking: 2.08%
● Ball Security: 2.08%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

READ & REACT — POWER FORWARD (PF)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 8.80%
● 3PT Spot-Up: 4.40%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 0.88%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 0.44%
● Free Throw: 0.44%
Finishing: 19.36%
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%

Playmaking: 15.84%
● Advantage Creation: 1.76%
● Passing Vision: 1.76%
● Passing Execution: 2.64%
● Advantage Passing: 1.76%
● Transition Playmaking: 1.32%
● Ball Security: 1.32%
● Connector Creation: 5.28%
TOOLS (TKR): 18% TOTAL
● Speed: 5.40%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

READ & REACT — CENTER (C)
TOTAL-PLAYER WEIGHTS ONLY
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 2.04%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.34%
Finishing: 19.72%
● Rim Pressure: 5.44%
● Contact Finishing: 5.44%
● Touch / Craft: 2.72%
● Foul Draw: 2.72%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%

Playmaking: 10.88%
● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.68%
● Ball Security: 0.68%
● Connector Creation: 3.74%
TOOLS (TKR): 20% TOTAL
● Speed: 6.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — NEUTRAL (ALL POSITIONS,
COLLEGE)
PACE & SPACE — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 20.16%
● 3PT Spot-Up: 4.48%
● 3PT Movement: 3.36%
● 3PT Pull-Up: 6.72%
● 3PT Deep Range: 2.24%
● Midrange Shotmaking: 1.12%
● Free Throw: 2.24%
Finishing: 10.08%
● Rim Pressure: 3.36%
● Contact Finishing: 1.68%
● Touch / Craft: 1.12%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 0.56%

Playmaking: 25.76%
● Advantage Creation: 7.17%
● Passing Vision: 3.58%
● Passing Execution: 3.58%
● Advantage Passing: 4.48%
● Transition Playmaking: 2.46%
● Ball Security: 3.13%
● Connector Creation: 1.36%
TOOLS (TKR): 10% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.80%
● Advantage Conversion: 1.50%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 29.00%
● 3PT Spot-Up: 7.91%
● 3PT Movement: 5.93%
● 3PT Pull-Up: 8.57%
● 3PT Deep Range: 2.64%
● Midrange Shotmaking: 1.98%
● Free Throw: 1.98%
Finishing: 13.92%
● Rim Pressure: 3.75%
● Contact Finishing: 2.68%
● Touch / Craft: 2.14%
● Foul Draw: 3.21%
● Vertical Finishing: 1.07%
● Transition Finishing: 1.07%

Playmaking: 15.08%
● Advantage Creation: 3.52%
● Passing Vision: 2.51%
● Passing Execution: 2.51%
● Advantage Passing: 3.02%
● Transition Playmaking: 1.51%
● Ball Security: 1.51%
● Connector Creation: 0.50%
TOOLS (TKR): 12% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.20%
● Motor: 3.00%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 23.92%
● 3PT Spot-Up: 8.37%
● 3PT Movement: 5.98%
● 3PT Pull-Up: 4.78%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.79%
● Free Throw: 1.20%
Finishing: 15.60%
● Rim Pressure: 4.88%
● Contact Finishing: 3.41%
● Touch / Craft: 2.44%
● Foul Draw: 2.93%
● Vertical Finishing: 0.98%
● Transition Finishing: 0.98%

Playmaking: 12.48%
● Advantage Creation: 2.67%
● Passing Vision: 2.23%
● Passing Execution: 2.23%
● Advantage Passing: 2.23%
● Transition Playmaking: 1.34%
● Ball Security: 0.89%
● Connector Creation: 0.89%
TOOLS (TKR): 14% TOTAL
● Speed: 4.90%
● Vertical Pop: 1.40%
● Motor: 3.50%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 12.32%
● 3PT Spot-Up: 5.69%
● 3PT Movement: 2.37%
● 3PT Pull-Up: 1.42%
● 3PT Deep Range: 0.95%
● Midrange Shotmaking: 0.95%
● Free Throw: 0.95%
Finishing: 19.36%
● Rim Pressure: 6.16%
● Contact Finishing: 4.40%
● Touch / Craft: 2.64%
● Foul Draw: 3.52%
● Vertical Finishing: 1.76%
● Transition Finishing: 0.88%

Playmaking: 12.32%
● Advantage Creation: 2.05%
● Passing Vision: 2.05%
● Passing Execution: 2.46%
● Advantage Passing: 2.05%
● Transition Playmaking: 0.82%
● Ball Security: 0.82%
● Connector Creation: 2.05%
TOOLS (TKR): 18% TOTAL
● Speed: 6.30%
● Vertical Pop: 1.80%
● Motor: 4.50%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.20%
(Other IQ traits unchanged by offense system.)

PACE & SPACE — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 5.44%
● 3PT Spot-Up: 3.11%
● 3PT Movement: 0.78%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.39%
● Midrange Shotmaking: 0.39%
● Free Throw: 0.78%
Finishing: 19.72%
● Rim Pressure: 5.26%
● Contact Finishing: 5.26%
● Touch / Craft: 2.63%
● Foul Draw: 3.29%
● Vertical Finishing: 2.63%
● Transition Finishing: 0.66%

Playmaking: 8.84%
● Advantage Creation: 1.02%
● Passing Vision: 1.36%
● Passing Execution: 2.04%
● Advantage Passing: 1.36%
● Transition Playmaking: 0.34%
● Ball Security: 0.68%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 7.00%
● Vertical Pop: 2.00%
● Motor: 5.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.20%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — NEUTRAL (ALL POSITIONS,
COLLEGE)
DRIBBLE DRIVE — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 16.80%
● 3PT Spot-Up: 4.20%
● 3PT Movement: 3.36%
● 3PT Pull-Up: 3.36%
● 3PT Deep Range: 1.68%
● Midrange Shotmaking: 0.84%
● Free Throw: 3.36%
Finishing: 15.68%
● Rim Pressure: 5.04%
● Contact Finishing: 2.24%
● Touch / Craft: 2.24%
● Foul Draw: 4.48%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 23.52%
● Advantage Creation: 6.72%
● Passing Vision: 3.36%
● Passing Execution: 3.36%
● Advantage Passing: 3.92%
● Transition Playmaking: 2.24%
● Ball Security: 2.80%
● Connector Creation: 1.12%
TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.00%
● Motor: 2.00%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.80%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 2.10%
● Role Discipline: 0.90%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 18.56% (58% × 32%)
● 3PT Spot-Up: 5.80% (18.56 × 10/32)
● 3PT Movement: 4.06% (18.56 × 7/32)
● 3PT Pull-Up: 2.90% (18.56 × 5/32)
● 3PT Deep Range: 1.16% (18.56 × 2/32)
● Midrange Shotmaking: 1.16% (18.56 × 2/32)
● Free Throw: 3.48% (18.56 × 6/32)
Finishing: 20.88% (58% × 36%)
● Rim Pressure: 6.38% (20.88 × 11/36)
● Contact Finishing: 4.06% (20.88 × 7/36)
● Touch / Craft: 2.90% (20.88 × 5/36)
● Foul Draw: 5.22% (20.88 × 9/36)
● Vertical Finishing: 1.16% (20.88 × 2/36)
● Transition Finishing: 1.16% (20.88 × 2/36)

Playmaking: 18.56% (58% × 32%)
● Advantage Creation: 5.80% (18.56 × 10/32)
● Passing Vision: 2.90% (18.56 × 5/32)
● Passing Execution: 2.90% (18.56 × 5/32)
● Advantage Passing: 2.90% (18.56 × 5/32)
● Transition Playmaking: 1.74% (18.56 × 3/32)
● Ball Security: 1.74% (18.56 × 3/32)
● Connector Creation: 0.58% (18.56 × 1/32)
TOOLS (TKR): 12% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.00%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.40%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56% (52% × 28%)
● 3PT Spot-Up: 5.20% (14.56 × 10/28)
● 3PT Movement: 3.12% (14.56 × 6/28)
● 3PT Pull-Up: 2.08% (14.56 × 4/28)
● 3PT Deep Range: 1.04% (14.56 × 2/28)
● Midrange Shotmaking: 1.04% (14.56 × 2/28)
● Free Throw: 2.08% (14.56 × 4/28)
Finishing: 21.84% (52% × 42%)
● Rim Pressure: 6.76% (21.84 × 13/42)
● Contact Finishing: 4.68% (21.84 × 9/42)
● Touch / Craft: 3.12% (21.84 × 6/42)
● Foul Draw: 5.20% (21.84 × 10/42)
● Vertical Finishing: 1.04% (21.84 × 2/42)
● Transition Finishing: 1.04% (21.84 × 2/42)

Playmaking: 15.60% (52% × 30%)
● Advantage Creation: 3.64% (15.60 × 7/30)
● Passing Vision: 2.08% (15.60 × 4/30)
● Passing Execution: 2.08% (15.60 × 4/30)
● Advantage Passing: 2.08% (15.60 × 4/30)
● Transition Playmaking: 1.56% (15.60 × 3/30)
● Ball Security: 1.56% (15.60 × 3/30)
● Connector Creation: 2.60% (15.60 × 5/30)
TOOLS (TKR): 14% TOTAL
● Speed: 4.20%
● Vertical Pop: 1.40%
● Motor: 4.00%
● Endurance: 4.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.20%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 1.40%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 7.92% (44% × 18%)
● 3PT Spot-Up: 3.08% (7.92 × 7/18)
● 3PT Movement: 1.32% (7.92 × 3/18)
● 3PT Pull-Up: 0.44% (7.92 × 1/18)
● 3PT Deep Range: 0.44% (7.92 × 1/18)
● Midrange Shotmaking: 0.88% (7.92 × 2/18)
● Free Throw: 1.76% (7.92 × 4/18)
Finishing: 22.88% (44% × 52%)
● Rim Pressure: 7.04% (22.88 × 16/52)
● Contact Finishing: 5.72% (22.88 × 13/52)
● Touch / Craft: 3.52% (22.88 × 8/52)
● Foul Draw: 4.40% (22.88 × 10/52)
● Vertical Finishing: 1.76% (22.88 × 4/52)
● Transition Finishing: 0.44% (22.88 × 1/52)

Playmaking: 13.20% (44% × 30%)
● Advantage Creation: 1.76% (13.20 × 4/30)
● Passing Vision: 1.76% (13.20 × 4/30)
● Passing Execution: 2.64% (13.20 × 6/30)
● Advantage Passing: 1.76% (13.20 × 4/30)
● Transition Playmaking: 1.32% (13.20 × 3/30)
● Ball Security: 0.88% (13.20 × 2/30)
● Connector Creation: 3.08% (13.20 × 7/30)
TOOLS (TKR): 18% TOTAL
● Speed: 5.50%
● Vertical Pop: 1.80%
● Motor: 5.00%
● Endurance: 5.70%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.70%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

DRIBBLE DRIVE — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 2.72% (34% × 8%)
● 3PT Spot-Up: 1.70% (2.72 × 5/8)
● 3PT Movement: 0.34% (2.72 × 1/8)
● 3PT Pull-Up: 0.00% (2.72 × 0/8)
● 3PT Deep Range: 0.34% (2.72 × 1/8)
● Midrange Shotmaking: 0.34% (2.72 × 1/8)
● Free Throw: 0.00% (2.72 × 0/8)
Finishing: 24.48% (34% × 72%)
● Rim Pressure: 6.12% (24.48 × 18/72)
● Contact Finishing: 7.48% (24.48 × 22/72)
● Touch / Craft: 3.06% (24.48 × 9/72)
● Foul Draw: 5.10% (24.48 × 15/72)
● Vertical Finishing: 2.04% (24.48 × 6/72)
● Transition Finishing: 0.68% (24.48 × 2/72)

Playmaking: 6.80% (34% × 20%)
● Advantage Creation: 0.68% (6.80 × 2/20)
● Passing Vision: 1.02% (6.80 × 3/20)
● Passing Execution: 1.36% (6.80 × 4/20)
● Advantage Passing: 1.02% (6.80 × 3/20)
● Transition Playmaking: 0.34% (6.80 × 1/20)
● Ball Security: 0.34% (6.80 × 1/20)
● Connector Creation: 2.04% (6.80 × 6/20)
TOOLS (TKR): 20% TOTAL
● Speed: 6.50%
● Vertical Pop: 2.00%
● Motor: 5.50%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.30%
● Advantage Conversion: 0.80%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PRINCETON — NEUTRAL (ALL POSITIONS, COLLEGE)
PRINCETON — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 15.68%
● 3PT Spot-Up: 4.70%
● 3PT Movement: 3.13%
● 3PT Pull-Up: 2.35%
● 3PT Deep Range: 1.57%
● Midrange Shotmaking: 1.57%
● Free Throw: 2.35%
Finishing: 10.08%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 30.24%
● Advantage Creation: 6.72%
● Passing Vision: 4.70%
● Passing Execution: 4.70%
● Advantage Passing: 4.03%
● Transition Playmaking: 2.02%
● Ball Security: 3.36%
● Connector Creation: 4.71%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.50%
● Motor: 3.00%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.20%
(Other IQ traits unchanged by offense system.)

PRINCETON — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 19.72%
● 3PT Spot-Up: 6.50%
● 3PT Movement: 4.73%
● 3PT Pull-Up: 2.36%
● 3PT Deep Range: 1.18%
● Midrange Shotmaking: 1.18%
● Free Throw: 3.77%
Finishing: 11.60%
● Rim Pressure: 3.22%
● Contact Finishing: 1.93%
● Touch / Craft: 1.93%
● Foul Draw: 2.58%
● Vertical Finishing: 0.64%
● Transition Finishing: 1.29%

Playmaking: 26.68%
● Advantage Creation: 5.34%
● Passing Vision: 4.45%
● Passing Execution: 4.45%
● Advantage Passing: 3.56%
● Transition Playmaking: 2.22%
● Ball Security: 2.67%
● Connector Creation: 4.00%
TOOLS (TKR): 12% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.60%
● Motor: 3.60%
● Endurance: 5.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

PRINCETON — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56%
● 3PT Spot-Up: 5.46%
● 3PT Movement: 3.64%
● 3PT Pull-Up: 1.82%
● 3PT Deep Range: 0.91%
● Midrange Shotmaking: 1.82%
● Free Throw: 0.91%
Finishing: 11.44%
● Rim Pressure: 3.12%
● Contact Finishing: 2.08%
● Touch / Craft: 2.08%
● Foul Draw: 2.08%
● Vertical Finishing: 0.52%
● Transition Finishing: 1.56%

Playmaking: 26.00%
● Advantage Creation: 4.68%
● Passing Vision: 4.68%
● Passing Execution: 4.68%
● Advantage Passing: 3.64%
● Transition Playmaking: 2.60%
● Ball Security: 2.60%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 2.80%
● Vertical Pop: 0.70%
● Motor: 4.20%
● Endurance: 6.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 0.80%
(Other IQ traits unchanged by offense system.)

PRINCETON — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 8.80%
● 3PT Spot-Up: 3.30%
● 3PT Movement: 1.54%
● 3PT Pull-Up: 0.88%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 1.32%
● Free Throw: 1.32%
Finishing: 11.44%
● Rim Pressure: 3.08%
● Contact Finishing: 2.64%
● Touch / Craft: 1.76%
● Foul Draw: 1.76%
● Vertical Finishing: 0.88%
● Transition Finishing: 1.32%

Playmaking: 23.76%
● Advantage Creation: 3.30%
● Passing Vision: 3.96%
● Passing Execution: 3.96%
● Advantage Passing: 3.30%
● Transition Playmaking: 2.64%
● Ball Security: 2.64%
● Connector Creation: 3.96%
TOOLS (TKR): 18% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.90%
● Motor: 5.40%
● Endurance: 9.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

PRINCETON — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 1.70%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.34%
Finishing: 8.16%
● Rim Pressure: 2.04%
● Contact Finishing: 2.04%
● Touch / Craft: 1.36%
● Foul Draw: 1.36%
● Vertical Finishing: 0.68%
● Transition Finishing: 0.68%

Playmaking: 22.44%
● Advantage Creation: 3.06%
● Passing Vision: 4.08%
● Passing Execution: 4.08%
● Advantage Passing: 3.40%
● Transition Playmaking: 2.72%
● Ball Security: 2.72%
● Connector Creation: 2.38%
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.00%
● Motor: 7.00%
● Endurance: 10.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

FLEX — NEUTRAL (ALL POSITIONS, COLLEGE)
FLEX — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 16.80%
● 3PT Spot-Up: 4.70%
● 3PT Movement: 2.69%
● 3PT Pull-Up: 3.36%
● 3PT Deep Range: 1.68%
● Midrange Shotmaking: 1.68%
● Free Throw: 2.69%
Finishing: 11.20%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.68%

Playmaking: 28.00%
● Advantage Creation: 5.60%
● Passing Vision: 4.20%
● Passing Execution: 4.20%
● Advantage Passing: 4.20%
● Transition Playmaking: 1.40%
● Ball Security: 2.80%
● Connector Creation: 5.60%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.75%
● Motor: 3.25%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

FLEX — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 20.88% (58% × 36%)
● 3PT Spot-Up: 7.25%
● 3PT Movement: 5.80%
● 3PT Pull-Up: 4.35%
● 3PT Deep Range: 1.45%
● Midrange Shotmaking: 1.45%
● Free Throw: 0.58%
Finishing: 13.92% (58% × 24%)
● Rim Pressure: 4.06%
● Contact Finishing: 2.32%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 1.16%
● Transition Finishing: 1.74%

Playmaking: 23.20% (58% × 40%)
● Advantage Creation: 4.64%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 3.48%
● Transition Playmaking: 2.32%
● Ball Security: 2.32%
● Connector Creation: 6.96%
TOOLS (TKR): 12% TOTAL
● Speed: 3.00%
● Vertical Pop: 1.00%
● Motor: 3.80%
● Endurance: 4.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

FLEX — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 16.64% (52% × 32%)
● 3PT Spot-Up: 6.66%
● 3PT Movement: 4.68%
● 3PT Pull-Up: 3.12%
● 3PT Deep Range: 0.94%
● Midrange Shotmaking: 0.94%
● Free Throw: 0.30%
Finishing: 15.60% (52% × 30%)
● Rim Pressure: 4.68%
● Contact Finishing: 3.12%
● Touch / Craft: 2.34%
● Foul Draw: 2.34%
● Vertical Finishing: 1.04%
● Transition Finishing: 2.08%

Playmaking: 19.76% (52% × 38%)
● Advantage Creation: 3.12%
● Passing Vision: 2.60%
● Passing Execution: 2.60%
● Advantage Passing: 2.60%
● Transition Playmaking: 1.56%
● Ball Security: 1.56%
● Connector Creation: 5.72%
TOOLS (TKR): 14% TOTAL
● Speed: 3.10%
● Vertical Pop: 1.10%
● Motor: 4.50%
● Endurance: 5.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other Tools traits unchanged by offense system.)

FLEX — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 10.56% (44% × 24%)
● 3PT Spot-Up: 4.84%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.88%
● Free Throw: 0.44%
Finishing: 15.84% (44% × 36%)
● Rim Pressure: 4.84%
● Contact Finishing: 3.52%
● Touch / Craft: 2.20%
● Foul Draw: 2.64%
● Vertical Finishing: 1.32%
● Transition Finishing: 1.32%

Playmaking: 17.60% (44% × 40%)
● Advantage Creation: 1.76%
● Passing Vision: 1.76%
● Passing Execution: 2.64%
● Advantage Passing: 1.76%
● Transition Playmaking: 1.76%
● Ball Security: 0.88%
● Connector Creation: 7.04%
TOOLS (TKR): 18% TOTAL
● Speed: 3.60%
● Vertical Pop: 1.40%
● Motor: 6.00%
● Endurance: 7.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.60%
(Other Tools traits unchanged by offense system.)

FLEX — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 4.08% (34% × 12%)
● 3PT Spot-Up: 2.38%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.34%
Finishing: 12.92% (34% × 38%)
● Rim Pressure: 3.74%
● Contact Finishing: 3.40%
● Touch / Craft: 1.70%
● Foul Draw: 1.70%
● Vertical Finishing: 1.36%
● Transition Finishing: 1.02%

Playmaking: **17.00% (34% × 50%)
● Advantage Creation: 1.70%
● Passing Vision: 2.72%
● Passing Execution: 2.72%
● Advantage Passing: 2.38%
● Transition Playmaking: 1.70%
● Ball Security: 1.70%
● Connector Creation: 4.08%
TOOLS (TKR): 20% TOTAL
● Speed: 2.50%
● Vertical Pop: 1.50%
● Motor: 7.50%
● Endurance: 8.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.60%
(Other Tools traits unchanged by offense system.)

SWING — NEUTRAL (ALL POSITIONS, COLLEGE)
SWING — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 17.92%
● 3PT Spot-Up: 5.38%
● 3PT Movement: 3.58%
● 3PT Pull-Up: 3.58%
● 3PT Deep Range: 1.79%
● Midrange Shotmaking: 1.34%
● Free Throw: 2.25%
Finishing: 10.08%
● Rim Pressure: 2.80%
● Contact Finishing: 1.68%
● Touch / Craft: 1.12%
● Foul Draw: 2.80%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.12%

Playmaking: 28.00%
● Advantage Creation: 5.60%
● Passing Vision: 4.20%
● Passing Execution: 4.20%
● Advantage Passing: 4.48%
● Transition Playmaking: 1.68%
● Ball Security: 2.52%
● Connector Creation: 5.32%
TOOLS (TKR): 10% TOTAL
● Speed: 2.75%
● Vertical Pop: 0.75%
● Motor: 3.00%
● Endurance: 3.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

SWING — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 26.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 5.46%
● 3PT Pull-Up: 7.88%
● 3PT Deep Range: 2.43%
● Midrange Shotmaking: 1.82%
● Free Throw: 1.82%
Finishing: 12.76%
● Rim Pressure: 3.44%
● Contact Finishing: 2.45%
● Touch / Craft: 1.96%
● Foul Draw: 2.45%
● Vertical Finishing: 0.98%
● Transition Finishing: 1.47%

Playmaking: 18.56%
● Advantage Creation: 4.33%
● Passing Vision: 3.09%
● Passing Execution: 3.09%
● Advantage Passing: 3.71%
● Transition Playmaking: 1.86%
● Ball Security: 1.86%
● Connector Creation: 0.62%
TOOLS (TKR): 12% TOTAL
● Speed: 3.30%
● Vertical Pop: 1.00%
● Motor: 3.60%
● Endurance: 4.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

SWING — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 21.84%
● 3PT Spot-Up: 7.64%
● 3PT Movement: 5.46%
● 3PT Pull-Up: 4.37%
● 3PT Deep Range: 1.64%
● Midrange Shotmaking: 1.64%
● Free Throw: 1.09%
Finishing: 14.56%
● Rim Pressure: 4.55%
● Contact Finishing: 3.19%
● Touch / Craft: 2.27%
● Foul Draw: 2.73%
● Vertical Finishing: 0.91%
● Transition Finishing: 0.91%

Playmaking: 15.60%
● Advantage Creation: 3.34%
● Passing Vision: 2.79%
● Passing Execution: 2.79%
● Advantage Passing: 2.79%
● Transition Playmaking: 1.67%
● Ball Security: 1.11%
● Connector Creation: 1.11%
TOOLS (TKR): 14% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.40%
● Motor: 4.20%
● Endurance: 4.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.40%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.80%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

SWING — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 12.32%
● 3PT Spot-Up: 5.69%
● 3PT Movement: 2.37%
● 3PT Pull-Up: 1.42%
● 3PT Deep Range: 0.95%
● Midrange Shotmaking: 0.95%
● Free Throw: 0.95%
Finishing: 17.60%
● Rim Pressure: 5.60%
● Contact Finishing: 4.00%
● Touch / Craft: 2.40%
● Foul Draw: 3.20%
● Vertical Finishing: 1.60%
● Transition Finishing: 0.80%

Playmaking: 14.08%
● Advantage Creation: 2.35%
● Passing Vision: 2.35%
● Passing Execution: 2.82%
● Advantage Passing: 2.35%
● Transition Playmaking: 0.94%
● Ball Security: 0.94%
● Connector Creation: 2.35%
TOOLS (TKR): 18% TOTAL
● Speed: 5.00%
● Vertical Pop: 1.80%
● Motor: 5.40%
● Endurance: 5.80%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

SWING — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 5.44%
● 3PT Spot-Up: 3.11%
● 3PT Movement: 0.78%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.39%
● Midrange Shotmaking: 0.39%
● Free Throw: 0.78%
Finishing: 19.04%
● Rim Pressure: 5.08%
● Contact Finishing: 5.08%
● Touch / Craft: 2.54%
● Foul Draw: 3.17%
● Vertical Finishing: 2.54%
● Transition Finishing: 0.63%

Playmaking: 9.52%
● Advantage Creation: 1.10%
● Passing Vision: 1.46%
● Passing Execution: 2.20%
● Advantage Passing: 1.46%
● Transition Playmaking: 0.37%
● Ball Security: 0.73%
● Connector Creation: 2.20%
TOOLS (TKR): 20% TOTAL
● Speed: 6.00%
● Vertical Pop: 2.00%
● Motor: 6.00%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.70%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.40%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — NEUTRAL (ALL POSITIONS, COLLEGE)
INSIDE-OUT — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 15.68%
● 3PT Spot-Up: 5.49%
● 3PT Movement: 2.66%
● 3PT Pull-Up: 2.35%
● 3PT Deep Range: 1.57%
● Midrange Shotmaking: 1.57%
● Free Throw: 2.04%
Finishing: 10.08%
● Rim Pressure: 2.52%
● Contact Finishing: 1.68%
● Touch / Craft: 1.68%
● Foul Draw: 2.24%
● Vertical Finishing: 0.56%
● Transition Finishing: 1.40%

Playmaking: 30.24%
● Advantage Creation: 5.38%
● Passing Vision: 4.70%
● Passing Execution: 4.70%
● Advantage Passing: 4.03%
● Transition Playmaking: 1.68%
● Ball Security: 3.36%
● Connector Creation: 6.39%
TOOLS (TKR): 10% TOTAL
● Speed: 2.50%
● Vertical Pop: 0.50%
● Motor: 3.00%
● Endurance: 4.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 2.40%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 0.90%
● Role Discipline: 1.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 18.56% (58% × 32%)
● 3PT Spot-Up: 7.54%
● 3PT Movement: 3.48%
● 3PT Pull-Up: 2.32%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 2.90%
Finishing: 12.76% (58% × 22%)
● Rim Pressure: 3.48%
● Contact Finishing: 2.32%
● Touch / Craft: 2.32%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 1.74%

Playmaking: 26.68% (58% × 46%)
● Advantage Creation: 4.64%
● Passing Vision: 4.06%
● Passing Execution: 4.06%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.74%
● Ball Security: 2.90%
● Connector Creation: 5.80%
TOOLS (TKR): 12% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.60%
● Motor: 3.60%
● Endurance: 5.10%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.60%
● Role Discipline: 1.00%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 14.56% (52% × 28%)
● 3PT Spot-Up: 6.24%
● 3PT Movement: 2.60%
● 3PT Pull-Up: 1.82%
● 3PT Deep Range: 0.91%
● Midrange Shotmaking: 1.82%
● Free Throw: 1.17%
Finishing: 12.48% (52% × 24%)
● Rim Pressure: 3.12%
● Contact Finishing: 2.60%
● Touch / Craft: 2.08%
● Foul Draw: 2.08%
● Vertical Finishing: 0.52%
● Transition Finishing: 2.08%

Playmaking: 24.96% (52% × 48%)
● Advantage Creation: 3.64%
● Passing Vision: 4.16%
● Passing Execution: 4.16%
● Advantage Passing: 3.64%
● Transition Playmaking: 2.60%
● Ball Security: 3.12%
● Connector Creation: 3.64%
TOOLS (TKR): 14% TOTAL
● Speed: 2.80%
● Vertical Pop: 0.70%
● Motor: 4.20%
● Endurance: 6.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.60%
● Shot Selection Quality: 0.80%
● Advantage Conversion: 0.60%
● Role Discipline: 1.00%
(Other Tools traits unchanged by offense system.)

INSIDE-OUT — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 7.92% (44% × 18%)
● 3PT Spot-Up: 3.08%
● 3PT Movement: 1.32%
● 3PT Pull-Up: 0.44%
● 3PT Deep Range: 0.44%
● Midrange Shotmaking: 1.32%
● Free Throw: 1.32%
Finishing: 13.20% (44% × 30%)
● Rim Pressure: 3.52%
● Contact Finishing: 3.08%
● Touch / Craft: 2.20%
● Foul Draw: 2.20%
● Vertical Finishing: 0.88%
● Transition Finishing: 1.32%

Playmaking: 22.88% (44% × 52%)
● Advantage Creation: 2.64%
● Passing Vision: 3.96%
● Passing Execution: 3.96%
● Advantage Passing: 3.52%
● Transition Playmaking: 2.64%
● Ball Security: 2.64%
● Connector Creation: 3.52%
TOOLS (TKR): 18% TOTAL
● Speed: 2.70%
● Vertical Pop: 0.90%
● Motor: 5.40%
● Endurance: 9.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.30%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

INSIDE-OUT — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 2.72% (34% × 8%)
● 3PT Spot-Up: 1.36%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.68%
● Free Throw: 0.00%
Finishing: 7.48% (34% × 22%)
● Rim Pressure: 1.70%
● Contact Finishing: 1.70%
● Touch / Craft: 1.36%
● Foul Draw: 1.36%
● Vertical Finishing: 0.68%
● Transition Finishing: 0.68%

Playmaking: 23.80% (34% × 70%)
● Advantage Creation: 3.06%
● Passing Vision: 4.42%
● Passing Execution: 4.42%
● Advantage Passing: 4.08%
● Transition Playmaking: 2.72%
● Ball Security: 2.72%
● Connector Creation: 2.38%
TOOLS (TKR): 20% TOTAL
● Speed: 2.00%
● Vertical Pop: 1.00%
● Motor: 7.00%
● Endurance: 10.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.80%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.30%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

MOREYBALL — NEUTRAL (ALL POSITIONS, COLLEGE)
MOREYBALL — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 26.88%
● 3PT Spot-Up: 6.72%
● 3PT Movement: 4.03%
● 3PT Pull-Up: 10.08%
● 3PT Deep Range: 4.03%
● Midrange Shotmaking: 0.67%
● Free Throw: 1.34%
Finishing: 7.84%
● Rim Pressure: 2.80%
● Contact Finishing: 1.12%
● Touch / Craft: 0.56%
● Foul Draw: 2.80%
● Vertical Finishing: 0.28%
● Transition Finishing: 0.28%

Playmaking: 21.28%
● Advantage Creation: 6.38%
● Passing Vision: 2.98%
● Passing Execution: 2.98%
● Advantage Passing: 3.72%
● Transition Playmaking: 1.49%
● Ball Security: 2.23%
● Connector Creation: 1.49%
TOOLS (TKR): 10% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.00%
● Motor: 2.50%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.80%
● Shot Selection Quality: 2.10%
● Advantage Conversion: 1.50%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

MOREYBALL — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 30.16%
● 3PT Spot-Up: 10.56%
● 3PT Movement: 6.03%
● 3PT Pull-Up: 7.54%
● 3PT Deep Range: 3.62%
● Midrange Shotmaking: 0.90%
● Free Throw: 1.51%
Finishing: 9.28%
● Rim Pressure: 3.06%
● Contact Finishing: 1.58%
● Touch / Craft: 0.93%
● Foul Draw: 2.79%
● Vertical Finishing: 0.46%
● Transition Finishing: 0.46%

Playmaking: 18.56%
● Advantage Creation: 4.45%
● Passing Vision: 2.23%
● Passing Execution: 2.23%
● Advantage Passing: 2.97%
● Transition Playmaking: 1.86%
● Ball Security: 1.86%
● Connector Creation: 2.97%
TOOLS (TKR): 12% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.20%
● Motor: 3.00%
● Endurance: 3.30%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.10%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.20%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

MOREYBALL — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 24.96%
● 3PT Spot-Up: 9.98%
● 3PT Movement: 4.99%
● 3PT Pull-Up: 4.49%
● 3PT Deep Range: 2.50%
● Midrange Shotmaking: 1.00%
● Free Throw: 2.00%
Finishing: 11.44%
● Rim Pressure: 3.66%
● Contact Finishing: 2.29%
● Touch / Craft: 1.37%
● Foul Draw: 2.97%
● Vertical Finishing: 0.57%
● Transition Finishing: 0.57%

Playmaking: 15.60%
● Advantage Creation: 2.81%
● Passing Vision: 2.18%
● Passing Execution: 2.18%
● Advantage Passing: 2.18%
● Transition Playmaking: 1.56%
● Ball Security: 1.56%
● Connector Creation: 3.12%
TOOLS (TKR): 14% TOTAL
● Speed: 5.00%
● Vertical Pop: 1.40%
● Motor: 3.80%
● Endurance: 3.80%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.00%
● Shot Selection Quality: 1.10%
● Advantage Conversion: 1.30%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

MOREYBALL — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 14.08%
● 3PT Spot-Up: 7.74%
● 3PT Movement: 2.11%
● 3PT Pull-Up: 0.70%
● 3PT Deep Range: 1.13%
● Midrange Shotmaking: 0.99%
● Free Throw: 1.41%
Finishing: 22.00%
● Rim Pressure: 6.16%
● Contact Finishing: 5.28%
● Touch / Craft: 2.64%
● Foul Draw: 4.40%
● Vertical Finishing: 2.64%
● Transition Finishing: 0.88%

Playmaking: 7.92%
● Advantage Creation: 0.95%
● Passing Vision: 0.95%
● Passing Execution: 1.43%
● Advantage Passing: 0.95%
● Transition Playmaking: 0.48%
● Ball Security: 0.63%
● Connector Creation: 2.53%
TOOLS (TKR): 18% TOTAL
● Speed: 5.50%
● Vertical Pop: 1.80%
● Motor: 5.30%
● Endurance: 5.40%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

MOREYBALL — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 7.48%
● 3PT Spot-Up: 4.49%
● 3PT Movement: 1.12%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.75%
● Midrange Shotmaking: 0.37%
● Free Throw: 0.75%
Finishing: 21.76%
● Rim Pressure: 4.79%
● Contact Finishing: 6.53%
● Touch / Craft: 2.61%
● Foul Draw: 4.35%
● Vertical Finishing: 3.05%
● Transition Finishing: 0.44%

Playmaking: 4.76%
● Advantage Creation: 0.48%
● Passing Vision: 0.86%
● Passing Execution: 1.05%
● Advantage Passing: 0.86%
● Transition Playmaking: 0.24%
● Ball Security: 0.33%
● Connector Creation: 0.95%
TOOLS (TKR): 20% TOTAL
● Speed: 6.50%
● Vertical Pop: 2.00%
● Motor: 5.50%
● Endurance: 6.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.50%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.60%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — NEUTRAL (ALL POSITIONS,
COLLEGE)
HELIOCENTRIC — POINT GUARD (PG)
Offense (OKR): 56%
Defense (DKR): 28%
Tools (TKR): 10%
IQ (IQKR): 6%
OFFENSE (OKR): 56% TOTAL
Shooting: 19.04%
● 3PT Spot-Up: 3.81%
● 3PT Movement: 1.90%
● 3PT Pull-Up: 7.62%
● 3PT Deep Range: 2.86%
● Midrange Shotmaking: 1.90%
● Free Throw: 0.95%
Finishing: 8.96%
● Rim Pressure: 3.36%
● Contact Finishing: 1.68%
● Touch / Craft: 0.90%
● Foul Draw: 2.24%
● Vertical Finishing: 0.45%
● Transition Finishing: 0.34%

Playmaking: 28.00%
● Advantage Creation: 9.80%
● Passing Vision: 3.92%
● Passing Execution: 3.92%
● Advantage Passing: 4.20%
● Transition Playmaking: 1.12%
● Ball Security: 3.36%
● Connector Creation: 1.68%
TOOLS (TKR): 10% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.25%
● Motor: 1.75%
● Endurance: 2.50%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 6% TOTAL
● Correct Read Rate: 1.50%
● Shot Selection Quality: 2.10%
● Advantage Conversion: 1.80%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — SHOOTING GUARD (SG)
Offense (OKR): 58%
Defense (DKR): 26%
Tools (TKR): 12%
IQ (IQKR): 4%
OFFENSE (OKR): 58% TOTAL
Shooting: 22.04%
● 3PT Spot-Up: 8.12%
● 3PT Movement: 4.64%
● 3PT Pull-Up: 5.80%
● 3PT Deep Range: 1.16%
● Midrange Shotmaking: 1.16%
● Free Throw: 1.16%
Finishing: 10.44%
● Rim Pressure: 2.90%
● Contact Finishing: 2.32%
● Touch / Craft: 1.74%
● Foul Draw: 2.32%
● Vertical Finishing: 0.58%
● Transition Finishing: 0.58%

Playmaking: 25.52%
● Advantage Creation: 8.12%
● Passing Vision: 3.48%
● Passing Execution: 3.48%
● Advantage Passing: 3.48%
● Transition Playmaking: 1.16%
● Ball Security: 3.48%
● Connector Creation: 2.32%
TOOLS (TKR): 12% TOTAL
● Speed: 4.00%
● Vertical Pop: 1.20%
● Motor: 2.80%
● Endurance: 3.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.30%
● Shot Selection Quality: 1.40%
● Advantage Conversion: 0.90%
● Role Discipline: 0.40%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — SMALL FORWARD (SF)
Offense (OKR): 52%
Defense (DKR): 30%
Tools (TKR): 14%
IQ (IQKR): 4%
OFFENSE (OKR): 52% TOTAL
Shooting: 17.68%
● 3PT Spot-Up: 7.28%
● 3PT Movement: 3.12%
● 3PT Pull-Up: 4.16%
● 3PT Deep Range: 1.04%
● Midrange Shotmaking: 1.04%
● Free Throw: 1.04%
Finishing: 11.44%
● Rim Pressure: 4.16%
● Contact Finishing: 3.12%
● Touch / Craft: 1.56%
● Foul Draw: 1.56%
● Vertical Finishing: 0.52%
● Transition Finishing: 0.52%

Playmaking: 22.88%
● Advantage Creation: 6.24%
● Passing Vision: 3.12%
● Passing Execution: 3.12%
● Advantage Passing: 3.12%
● Transition Playmaking: 1.04%
● Ball Security: 2.08%
● Connector Creation: 4.16%
TOOLS (TKR): 14% TOTAL
● Speed: 4.50%
● Vertical Pop: 1.40%
● Motor: 3.50%
● Endurance: 3.60%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 4% TOTAL
● Correct Read Rate: 1.20%
● Shot Selection Quality: 1.20%
● Advantage Conversion: 1.00%
● Role Discipline: 0.60%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — POWER FORWARD (PF)
Offense (OKR): 44%
Defense (DKR): 36%
Tools (TKR): 18%
IQ (IQKR): 2%
OFFENSE (OKR): 44% TOTAL
Shooting: 11.44%
● 3PT Spot-Up: 6.16%
● 3PT Movement: 2.20%
● 3PT Pull-Up: 1.32%
● 3PT Deep Range: 0.88%
● Midrange Shotmaking: 0.44%
● Free Throw: 0.44%
Finishing: 14.08%
● Rim Pressure: 4.40%
● Contact Finishing: 3.52%
● Touch / Craft: 2.20%
● Foul Draw: 2.20%
● Vertical Finishing: 1.32%
● Transition Finishing: 0.44%

Playmaking: 18.48%
● Advantage Creation: 2.64%
● Passing Vision: 2.64%
● Passing Execution: 3.52%
● Advantage Passing: 2.64%
● Transition Playmaking: 0.88%
● Ball Security: 1.76%
● Connector Creation: 4.40%
TOOLS (TKR): 18% TOTAL
● Speed: 3.50%
● Vertical Pop: 1.80%
● Motor: 5.50%
● Endurance: 5.20%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.60%
● Advantage Conversion: 0.50%
● Role Discipline: 0.30%
(Other IQ traits unchanged by offense system.)

HELIOCENTRIC — CENTER (C)
Offense (OKR): 34%
Defense (DKR): 44%
Tools (TKR): 20%
IQ (IQKR): 2%
OFFENSE (OKR): 34% TOTAL
Shooting: 3.40%
● 3PT Spot-Up: 2.04%
● 3PT Movement: 0.34%
● 3PT Pull-Up: 0.00%
● 3PT Deep Range: 0.34%
● Midrange Shotmaking: 0.34%
● Free Throw: 0.34%
Finishing: 18.36%
● Rim Pressure: 4.76%
● Contact Finishing: 5.44%
● Touch / Craft: 2.04%
● Foul Draw: 2.72%
● Vertical Finishing: 2.72%
● Transition Finishing: 0.68%

Playmaking: 12.24%
● Advantage Creation: 1.36%
● Passing Vision: 2.04%
● Passing Execution: 2.72%
● Advantage Passing: 2.04%
● Transition Playmaking: 0.68%
● Ball Security: 1.36%
● Connector Creation: 2.04%
TOOLS (TKR): 20% TOTAL
● Speed: 2.50%
● Vertical Pop: 2.00%
● Motor: 7.00%
● Endurance: 7.00%
(Other Tools traits unchanged by offense system.)
IQ (IQKR): 2% TOTAL
● Correct Read Rate: 0.60%
● Shot Selection Quality: 0.40%
● Advantage Conversion: 0.50%
● Role Discipline: 0.50%
(Other IQ traits unchanged by offense system.)

COACH K
COACH K — POINT GUARD (PG)
Buckets: OKR 62 | DKR 24 | TKR 6 | IQKR 8
OFFENSE (OKR): 62
Shooting: 36
● 3PT Spot-Up: 8
● 3PT Movement: 6
● 3PT Pull-Up: 14
● 3PT Deep Range: 7
● Midrange Shotmaking: 0.5
● Free Throw: 0.5
Finishing: 5
● Rim Pressure: 1.5
● Contact Finishing: 0.7
● Touch / Craft: 0.7
● Foul Draw: 1.2
● Vertical Finishing: 0.5
● Transition Finishing: 0.4
Playmaking: 21 (kickouts + 1-second reads, no long holds)
● Advantage Creation: 4.5
● Passing Vision: 3.5
● Passing Execution: 3.5
● Advantage Passing: 4.0
● Transition Playmaking: 3.0
● Ball Security: 1.5
● Connector Creation: 1.0
TOOLS (TKR): 6
● Speed: 2.2
● Vertical Pop: 0.5
● Motor: 1.3
● Endurance: 2.0

IQ (IQKR): 8
● Correct Read Rate: 2.6
● Shot Selection Quality: 2.0
● Advantage Conversion: 2.6
● Role Discipline: 0.8

COACH K — SHOOTING GUARD (SG)
Buckets: OKR 64 | DKR 22 | TKR 8 | IQKR 6
OFFENSE (OKR): 64
Shooting: 40
● 3PT Spot-Up: 14
● 3PT Movement: 8
● 3PT Pull-Up: 10
● 3PT Deep Range: 6
● Midrange Shotmaking: 1
● Free Throw: 1
Finishing: 6
● Rim Pressure: 1.5
● Contact Finishing: 1.2
● Touch / Craft: 0.6
● Foul Draw: 1.7
● Vertical Finishing: 0.5
● Transition Finishing: 0.5
Playmaking: 18 (quick swing decisions)
● Advantage Creation: 3.0
● Passing Vision: 3.0
● Passing Execution: 3.0
● Advantage Passing: 3.5
● Transition Playmaking: 2.5
● Ball Security: 1.5
● Connector Creation: 1.5
TOOLS (TKR): 8
● Speed: 2.8
● Vertical Pop: 0.8
● Motor: 2.0
● Endurance: 2.4
IQ (IQKR): 6
● Correct Read Rate: 1.8
● Shot Selection Quality: 1.2
● Advantage Conversion: 2.4
● Role Discipline: 0.6

COACH K — SMALL FORWARD (SF)
Buckets: OKR 48 | DKR 34 | TKR 10 | IQKR 8
OFFENSE (OKR): 48 (3&D connector wing)
Shooting: 24 (spot-up + deep range)
● 3PT Spot-Up: 10
● 3PT Movement: 4
● 3PT Pull-Up: 2
● 3PT Deep Range: 6
● Midrange Shotmaking: 1
● Free Throw: 1
Finishing: 10 (runouts / cuts / closeout attacks — not self-creation heavy)
● Rim Pressure: 3.0
● Contact Finishing: 2.5
● Touch / Craft: 1.5
● Foul Draw: 2.0
● Vertical Finishing: 0.5
● Transition Finishing: 0.5
Playmaking: 14 (quick reads, swing-swing, 0.5-second decisions)
● Advantage Creation: 1.5
● Passing Vision: 2.5
● Passing Execution: 2.5
● Advantage Passing: 2.5
● Transition Playmaking: 1.5
● Ball Security: 1.0
● Connector Creation: 2.5
TOOLS (TKR): 10
● Speed: 2.5
● Vertical Pop: 1.0
● Motor: 3.0
● Endurance: 3.5
IQ (IQKR): 8 (connector brain)
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

COACH K — POWER FORWARD (PF)
Buckets: OKR 44 | DKR 36 | TKR 12 | IQKR 8
OFFENSE (OKR): 44 (big 3&D wing)
Shooting: 20 (spot-up heavy, deep range valuable)
● 3PT Spot-Up: 10.5
● 3PT Movement: 2.5
● 3PT Pull-Up: 0.8
● 3PT Deep Range: 4.0
● Midrange Shotmaking: 1.2
● Free Throw: 1.0
Finishing: 13 (roll/cut/closeout punish, not iso)
● Rim Pressure: 4.0
● Contact Finishing: 3.5
● Touch / Craft: 1.8
● Foul Draw: 2.0
● Vertical Finishing: 1.2
● Transition Finishing: 0.5
Playmaking: 11 (quick decisions, DHO/extra pass)
● Advantage Creation: 0.8
● Passing Vision: 1.7
● Passing Execution: 2.2
● Advantage Passing: 1.7
● Transition Playmaking: 0.8
● Ball Security: 0.4
● Connector Creation: 3.4
TOOLS (TKR): 12
● Speed: 3.0
● Vertical Pop: 1.2
● Motor: 3.6
● Endurance: 4.2
IQ (IQKR): 8
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

COACH K — CENTER (C)
Buckets: OKR 30 | DKR 48 | TKR 14 | IQKR 8
OFFENSE (OKR): 30 (play finisher + short-roll creator; no self-creation required)
Shooting: 6 (catch & shoot only)
● 3PT Spot-Up: 3.6
● 3PT Movement: 0.4
● 3PT Pull-Up: 0.0
● 3PT Deep Range: 1.2
● Midrange Shotmaking: 0.3
● Free Throw: 0.5
Finishing: 15 (rolls, dump-offs, lobs, touch)
● Rim Pressure: 4.0
● Contact Finishing: 4.0
● Touch / Craft: 2.5
● Foul Draw: 2.0
● Vertical Finishing: 2.0
● Transition Finishing: 0.5
Playmaking: 9 (short-roll reads, quick decisions)
● Advantage Creation: 0.5
● Passing Vision: 1.8
● Passing Execution: 1.8
● Advantage Passing: 1.8
● Transition Playmaking: 0.5
● Ball Security: 0.6
● Connector Creation: 2.0
TOOLS (TKR): 14
● Speed: 2.2
● Vertical Pop: 2.1
● Motor: 4.5
● Endurance: 5.2
IQ (IQKR): 8
● Correct Read Rate: 2.0
● Shot Selection Quality: 1.6
● Advantage Conversion: 2.0
● Role Discipline: 2.4

Defense

CONTAINMENT — NEUTRAL (ALL
POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Defense-only Tools + Defense-only IQ only: Height/Length/Strength/Lateral Quickness +
Decision Speed/Turnover Decision Quality/Processing Under Pressure.)
CONTAINMENT — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6
● Containment / Angle: 3.6
● Screen Navigation: 2.8
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 1.4
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.5
● Foul Discipline: 0.4
Team Defense: 11.2
● Help & Rotation: 3.2
● Communication / QB: 2.0
● Low-Man / Tag Responsibility: 2.0
● Rim Protection Support (verticality contests): 1.2
● No-3s Discipline (stunts/recover): 1.8
● Charges / Physicality: 1.0
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4

TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.0
● Length: 2.5
● Strength: 2.0
● Height: 1.5
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.4
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.6

CONTAINMENT — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 11.2
● Containment / Angle: 3.0
● Screen Navigation: 2.4
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 1.2
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 0.4
Team Defense: 10.4
● Help & Rotation: 3.0
● Communication / QB: 1.8
● Low-Man / Tag Responsibility: 1.8
● Rim Protection Support: 1.2
● No-3s Discipline (stunts/recover): 1.6
● Charges / Physicality: 1.0
Rebounding: 4.4
● Defensive Rebounding: 2.0
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.2
● Strength: 2.4
● Height: 2.2
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

CONTAINMENT — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle: 2.6
● Screen Navigation: 1.8
● Closeout & Recovery: 2.6
● Ball Pressure (controlled): 0.9
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Team Defense: 13.5
● Help & Rotation: 4.0
● Communication / QB: 2.4
● Low-Man / Tag Responsibility: 2.8
● Rim Protection Support: 2.0
● No-3s Discipline (stunts/recover): 1.5
● Charges / Physicality: 0.8
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.5
● Length: 4.0
● Strength: 3.5
● Height: 3.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

CONTAINMENT — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle: 2.6
● Screen Navigation: 1.4
● Closeout & Recovery: 3.0
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 0.8
● Steal Timing: 0.2
● Foul Discipline: 1.0
Team Defense: 16.2
● Help & Rotation: 4.6
● Communication / QB: 2.8
● Low-Man / Tag Responsibility: 3.8
● Rim Protection Support: 2.6
● No-3s Discipline (stunts/recover): 1.4
● Charges / Physicality: 1.0
Rebounding: 9.0
● Defensive Rebounding: 4.8
● Box Outs: 2.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 4.5
● Strength: 5.0
● Lateral Quickness: 4.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.7
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.5

CONTAINMENT — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 8.8 (coverage execution, not pressure)
● Containment / Angle (in space): 2.4
● Screen Navigation (coverage): 2.0
● Closeout & Recovery: 1.2
● Deflections / Disruption: 0.6
● Foul Discipline: 2.6
Team Defense: 24.2
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.0
● Low-Man / Tag Responsibility: 4.0
● Communication / QB: 3.0
● No-3s Discipline (stunts/recover): 1.6
● Charges / Physicality: 1.6
Rebounding: 11.0
● Defensive Rebounding: 6.2
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.0
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PACK LINE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
PACK LINE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 4.0
● Communication / QB: 2.4
● Low-Man / Tag: 2.6
● Rim Protection Support (verticality contests): 1.4
● No-3s Discipline (stunts/recover): 2.6
● Charges / Physicality: 1.0
POA Defense: 9.8
● Containment / Angle: 2.8
● Screen Navigation: 2.0
● Closeout & Recovery: 1.6
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 0.7
● Steal Timing: 0.3
● Foul Discipline: 0.8
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.3
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.4

TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.0
● Length: 2.5
● Strength: 2.0
● Height: 1.0
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.2
● Turnover Decision Quality: 1.6

PACK LINE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.8
● Communication / QB: 2.1
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.4
● No-3s Discipline (stunts/recover): 2.4
● Charges / Physicality: 1.1
POA Defense: 8.5
● Containment / Angle: 2.4
● Screen Navigation: 1.8
● Closeout & Recovery: 1.6
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.5
● Steal Timing: 0.2
● Foul Discipline: 0.8
Rebounding: 4.5
● Defensive Rebounding: 2.0
● Box Outs: 1.4
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.4
● Strength: 2.4
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.2

PACK LINE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.0
● Help & Rotation: 4.5
● Communication / QB: 2.4
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.8
● No-3s Discipline (stunts/recover): 2.2
● Charges / Physicality: 1.1
POA Defense: 8.4
● Containment / Angle: 2.0
● Screen Navigation: 1.2
● Closeout & Recovery: 2.0
● Ball Pressure (controlled): 0.5
● Denial / Off-ball Pressure: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.2
● Foul Discipline: 0.6
Rebounding: 6.6
● Defensive Rebounding: 3.4
● Box Outs: 2.0
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

PACK LINE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 17.3
● Help & Rotation: 5.0
● Communication / QB: 2.6
● Low-Man / Tag: 4.0
● Rim Protection Support: 3.0
● No-3s Discipline (stunts/recover): 1.7
● Charges / Physicality: 1.0
POA Defense: 7.9
● Containment / Angle: 1.6
● Screen Navigation: 0.8
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.8
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.8
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PACK LINE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 10.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (stunts/recover): 1.4
● Charges / Physicality: 1.0
POA Defense: 5.8 (coverage execution, not pressure)
● Containment / Angle (in space): 1.4
● Screen Navigation (coverage): 1.0
● Closeout & Recovery: 0.8
● Ball Pressure (controlled): 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 0.3
● Steal Timing: 0.0
● Foul Discipline: 2.0
Rebounding: 11.8
● Defensive Rebounding: 7.0
● Box Outs: 3.4
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.6
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

PRESSURE MAN — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
PRESSURE MAN — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 12.6
● Help & Rotation: 3.2
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 2.2
● Communication / QB: 2.0
● Charges / Physicality: 2.2
POA Defense: 12.6
● Ball Pressure: 3.4
● Screen Navigation: 3.2
● Containment / Angle: 2.2
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.8
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 2.8
● Defensive Rebounding: 1.2
● Box Outs: 0.8
● Rebound Range/Tracking: 0.5
● Hands/Secure: 0.3
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.6
● Length: 2.4
● Strength: 1.8
● Height: 1.2

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.4

PRESSURE MAN — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 11.7
● Help & Rotation: 3.0
● No-3s Discipline (stunts/recover): 2.6
● Low-Man / Tag: 2.0
● Communication / QB: 1.8
● Charges / Physicality: 2.3
POA Defense: 11.7
● Ball Pressure: 2.8
● Screen Navigation: 2.8
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 1.0
● Deflections / Disruption: 0.9
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 2.6
● Defensive Rebounding: 1.2
● Box Outs: 0.8
● Rebound Range/Tracking: 0.4
● Hands/Secure: 0.2
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.8
● Length: 3.2
● Strength: 2.4
● Height: 1.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

PRESSURE MAN — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 13.8
● Help & Rotation: 3.6
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 2.6
● Communication / QB: 2.2
● Charges / Physicality: 2.6
POA Defense: 12.0
● Ball Pressure: 2.2
● Screen Navigation: 2.2
● Containment / Angle: 2.2
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 1.8
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 4.2
● Defensive Rebounding: 2.2
● Box Outs: 1.2
● Rebound Range/Tracking: 0.5
● Hands/Secure: 0.3
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 4.2
● Length: 4.2
● Strength: 3.2
● Height: 2.4
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

PRESSURE MAN — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 16.2
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.8
● Communication / QB: 2.6
● Charges / Physicality: 3.0
POA Defense: 12.6
● Ball Pressure: 1.2
● Screen Navigation: 1.6
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.6
● Deflections / Disruption: 1.4
● Steal Timing: 0.2
● Foul Discipline: 2.0
Rebounding: 7.2
● Defensive Rebounding: 4.0
● Box Outs: 2.0
● Rebound Range/Tracking: 0.7
● Hands/Secure: 0.5
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

PRESSURE MAN — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 24.2
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.0
● Low-Man / Tag: 4.0
● Communication / QB: 3.0
● No-3s Discipline (stunts/recover): 1.2
● Charges / Physicality: 2.0
POA Defense: 6.6 (coverage execution, not pressure)
● Screen Navigation (coverage): 1.6
● Containment / Angle (in space): 2.0
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.4
● Foul Discipline: 1.8
Rebounding: 13.2
● Defensive Rebounding: 7.6
● Box Outs: 3.6
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.5
● Lateral Quickness: 2.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

SWITCH — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
SWITCH — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6
● Containment / Angle: 3.0
● Screen Navigation: 2.0
● Closeout & Recovery: 2.4
● Ball Pressure (controlled): 1.0
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 1.4
Team Defense: 10.6
● Communication / QB (switch calls): 3.0
● Help & Rotation: 2.0
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 1.6
● Rim Protection Support: 0.8
● Charges / Physicality: 0.8
Rebounding: 4.8
● Defensive Rebounding: 2.2
● Box Outs: 1.4
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.5
● Length: 2.5
● Strength: 2.0
● Height: 1.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.4

SWITCH — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 10.4
● Containment / Angle: 2.4
● Screen Navigation: 1.6
● Closeout & Recovery: 2.4
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 0.8
Team Defense: 9.6
● Communication / QB (switch calls): 2.8
● Help & Rotation: 1.6
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 1.4
● Rim Protection Support: 0.8
● Charges / Physicality: 0.8
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.2
● Length: 3.4
● Strength: 2.4
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.4
● Turnover Decision Quality: 1.0

SWITCH — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle: 2.6
● Screen Navigation: 1.4
● Closeout & Recovery: 2.8
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.1
Team Defense: 10.5
● Communication / QB (switch calls): 3.2
● Help & Rotation: 1.6
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 1.4
● Rim Protection Support: 0.8
● Charges / Physicality: 1.1
Rebounding: 9.0
● Defensive Rebounding: 5.0
● Box Outs: 2.6
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

SWITCH — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle: 2.6
● Screen Navigation: 0.8
● Closeout & Recovery: 3.2
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.5
Team Defense: 12.6
● Communication / QB (switch calls): 3.8
● Help & Rotation: 2.0
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 2.0
● Rim Protection Support: 1.2
● Charges / Physicality: 1.2
Rebounding: 12.6
● Defensive Rebounding: 7.2
● Box Outs: 3.4
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

SWITCH — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 8.8 (switch survive / contain in space)
● Containment / Angle (in space): 3.0
● Screen Navigation (switch coverage): 2.0
● Closeout & Recovery: 1.4
● Deflections / Disruption: 0.4
● Foul Discipline: 2.0
Team Defense: 17.6
● Communication / QB (switch calls): 5.0
● Help & Rotation: 3.6
● Low-Man / Tag: 3.2
● No-3s Discipline (stunts/recover): 2.2
● Rim Protection Support: 2.4
● Charges / Physicality: 1.2
Rebounding: 17.6
● Defensive Rebounding: 10.2
● Box Outs: 5.0
● Rebound Range/Tracking: 1.6
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.0
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

NO-MIDDLE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
NO-MIDDLE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 12.6 (angle + contain + ICE discipline)
● Containment / Angle (no-middle): 4.0
● Screen Navigation: 2.6
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 1.0
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.8
● Steal Timing: 0.4
● Foul Discipline: 1.4
Team Defense: 11.2 (gap, tags, rotations, “low-man”)
● Help & Rotation: 3.4
● No-3s Discipline (stunts/recover): 2.4
● Low-Man / Tag: 2.4
● Communication / QB: 2.0
● Rim Protection Support: 0.6
● Charges / Physicality: 0.4
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.2
● Length: 2.4
● Strength: 1.8

● Height: 1.6
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.4

NO-MIDDLE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 10.4
● Containment / Angle (no-middle): 3.2
● Screen Navigation: 2.2
● Closeout & Recovery: 1.8
● Ball Pressure (controlled): 0.8
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 0.6
● Steal Timing: 0.2
● Foul Discipline: 1.0
Team Defense: 10.4
● Help & Rotation: 3.2
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 2.0
● Communication / QB: 1.8
● Rim Protection Support: 0.8
● Charges / Physicality: 0.4
Rebounding: 5.2
● Defensive Rebounding: 2.4
● Box Outs: 1.4
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.4
● Length: 3.2
● Strength: 2.2
● Height: 2.2
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

NO-MIDDLE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 10.5
● Containment / Angle (no-middle): 2.8
● Screen Navigation: 1.6
● Closeout & Recovery: 2.8
● Ball Pressure (controlled): 0.6
● Denial / Off-ball Pressure: 1.2
● Deflections / Disruption: 1.0
● Steal Timing: 0.1
● Foul Discipline: 0.4
Team Defense: 13.5
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.0
● Communication / QB: 2.2
● Rim Protection Support: 1.1
● Charges / Physicality: 0.4
Rebounding: 6.0
● Defensive Rebounding: 3.0
● Box Outs: 1.8
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 3.8
● Length: 4.2
● Strength: 3.4
● Height: 2.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.0

NO-MIDDLE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8
● Containment / Angle (no-middle): 2.4
● Screen Navigation: 0.8
● Closeout & Recovery: 3.0
● Ball Pressure (controlled): 0.3
● Denial / Off-ball Pressure: 1.6
● Deflections / Disruption: 0.7
● Steal Timing: 0.1
● Foul Discipline: 1.9
Team Defense: 16.2
● Help & Rotation: 4.8
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 4.0
● Communication / QB: 2.4
● Rim Protection Support: 1.6
● Charges / Physicality: 0.4
Rebounding: 9.0
● Defensive Rebounding: 5.0
● Box Outs: 2.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 18 (defense tools only)
● Height: 4.8
● Length: 4.8
● Strength: 5.4
● Lateral Quickness: 3.0
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.6
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.6

NO-MIDDLE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 6.6 (coverage + contain at level, no-middle angles)
● Containment / Angle (in space): 2.0
● Screen Navigation (coverage): 1.6
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.2
● Foul Discipline: 2.0
Team Defense: 25.3
● Rim Protection / Shot Blocking: 9.5
● Help & Rotation: 5.5
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (stunts/recover): 1.8
● Charges / Physicality: 0.5
Rebounding: 12.1
● Defensive Rebounding: 7.0
● Box Outs: 3.6
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

ZONE — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
ZONE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 4.2
● No-3s Discipline (zone closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.2
● Rim Protection Support: 0.8
● Charges / Physicality: 0.6
POA Defense: 8.4 (less on-ball; more closeouts/contain in space)
● Closeout & Recovery: 2.8
● Containment / Angle: 2.0
● Screen Navigation: 0.6
● Ball Pressure: 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 1.2
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 5.6 (zone = gang rebound requirement)
● Defensive Rebounding: 2.4
● Box Outs: 1.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.6

ZONE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.8
● No-3s Discipline (zone closeouts): 2.8
● Communication / QB: 2.6
● Low-Man / Tag: 2.0
● Rim Protection Support: 1.0
● Charges / Physicality: 0.8
POA Defense: 6.5
● Closeout & Recovery: 2.0
● Containment / Angle: 1.6
● Screen Navigation: 0.4
● Ball Pressure: 0.4
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 6.5
● Defensive Rebounding: 3.0
● Box Outs: 2.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

ZONE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 4.4
● No-3s Discipline (zone closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.8
● Rim Protection Support: 1.2
● Charges / Physicality: 1.0
POA Defense: 6.0
● Closeout & Recovery: 2.0
● Containment / Angle: 1.4
● Screen Navigation: 0.4
● Ball Pressure: 0.3
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 8.4
● Defensive Rebounding: 4.2
● Box Outs: 2.6
● Rebound Range/Tracking: 1.1
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.0
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.2

ZONE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.6
● No-3s Discipline (zone closeouts): 3.8
● Communication / QB: 3.2
● Low-Man / Tag: 4.0
● Rim Protection Support: 2.2
● Charges / Physicality: 1.0
POA Defense: 5.4
● Closeout & Recovery: 1.8
● Containment / Angle: 1.2
● Screen Navigation: 0.3
● Ball Pressure: 0.2
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

ZONE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.5
● Communication / QB: 3.5
● No-3s Discipline (zone closeouts): 2.4
● Charges / Physicality: 1.0
POA Defense: 3.6 (minimal; mostly closeouts in space)
● Closeout & Recovery: 1.2
● Containment / Angle: 0.8
● Screen Navigation: 0.2
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 0.6
● Steal Timing: 0.1
● Foul Discipline: 0.4
Rebounding: 14.0
● Defensive Rebounding: 8.0
● Box Outs: 4.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

MATCHUP ZONE — Neutral (ALL POSITIONS,
COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
MATCHUP ZONE — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0
● Help & Rotation: 3.6
● No-3s Discipline (matchup closeouts): 3.2
● Communication / QB: 3.0
● Low-Man / Tag: 2.4
● Rim Protection Support: 1.0
● Charges / Physicality: 0.8
POA Defense: 9.8 (more man principles than pure zone)
● Closeout & Recovery: 2.8
● Containment / Angle: 2.4
● Screen Navigation: 1.0
● Ball Pressure: 0.8
● Denial / Off-ball Pressure: 0.8
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 0.4
Rebounding: 4.2
● Defensive Rebounding: 1.8
● Box Outs: 1.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)

● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.6

MATCHUP ZONE — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.4
● No-3s Discipline (matchup closeouts): 2.8
● Communication / QB: 2.6
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.2
● Charges / Physicality: 0.8
POA Defense: 7.8
● Closeout & Recovery: 2.0
● Containment / Angle: 2.0
● Screen Navigation: 0.8
● Ball Pressure: 0.6
● Denial / Off-ball Pressure: 0.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.6
● Foul Discipline: 0.2
Rebounding: 5.2
● Defensive Rebounding: 2.4
● Box Outs: 1.6
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.2

MATCHUP ZONE — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 4.0
● No-3s Discipline (matchup closeouts): 3.0
● Communication / QB: 3.0
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.6
● Charges / Physicality: 1.0
POA Defense: 6.6
● Closeout & Recovery: 1.8
● Containment / Angle: 1.6
● Screen Navigation: 0.6
● Ball Pressure: 0.3
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.2
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 7.8
● Defensive Rebounding: 4.0
● Box Outs: 2.4
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.0
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.2

MATCHUP ZONE — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.2
● No-3s Discipline (matchup closeouts): 3.6
● Communication / QB: 3.2
● Low-Man / Tag: 4.4
● Rim Protection Support: 2.4
● Charges / Physicality: 1.0
POA Defense: 5.4
● Closeout & Recovery: 1.6
● Containment / Angle: 1.2
● Screen Navigation: 0.3
● Ball Pressure: 0.2
● Denial / Off-ball Pressure: 0.5
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.2
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

MATCHUP ZONE — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 6.0
● Low-Man / Tag: 4.8
● Communication / QB: 3.6
● No-3s Discipline (matchup closeouts): 2.2
● Charges / Physicality: 0.8
POA Defense: 4.4
● Closeout & Recovery: 1.2
● Containment / Angle: 0.8
● Screen Navigation: 0.4
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.2
● Deflections / Disruption: 1.2
● Steal Timing: 0.1
● Foul Discipline: 0.4
Rebounding: 13.2
● Defensive Rebounding: 7.6
● Box Outs: 3.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

FULL-COURT PRESS — Neutral (ALL
POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
FULL-COURT PRESS — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
POA Defense: 14.0 (pressure + disruption + turn creation)
● Ball Pressure: 4.0
● Screen Navigation: 2.2
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 0.8
● Deflections / Disruption: 1.6
● Steal Timing: 1.2
● Foul Discipline: 0.6
Team Defense: 9.8 (scramble rotations + no-threes in chaos)
● Help & Rotation: 2.8
● No-3s Discipline (stunts/recover): 2.0
● Low-Man / Tag: 1.4
● Communication / QB: 1.6
● Rim Protection Support: 0.6
● Charges / Physicality: 1.4
Rebounding: 4.2
● Defensive Rebounding: 1.6
● Box Outs: 1.2
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 4.8
● Length: 2.4
● Strength: 1.6

● Height: 1.2
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 2.2
● Turnover Decision Quality: 1.2

FULL-COURT PRESS — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
POA Defense: 12.0
● Ball Pressure: 3.2
● Screen Navigation: 1.8
● Containment / Angle: 1.4
● Denial / Off-ball Pressure: 1.8
● Closeout & Recovery: 0.8
● Deflections / Disruption: 1.4
● Steal Timing: 0.8
● Foul Discipline: 0.8
Team Defense: 9.1
● Help & Rotation: 2.6
● No-3s Discipline (stunts/recover): 1.8
● Low-Man / Tag: 1.4
● Communication / QB: 1.4
● Rim Protection Support: 0.7
● Charges / Physicality: 1.2
Rebounding: 4.9
● Defensive Rebounding: 2.0
● Box Outs: 1.6
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 4.6
● Length: 3.2
● Strength: 2.2
● Height: 2.0
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.6
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 0.8

FULL-COURT PRESS — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
POA Defense: 12.0
● Ball Pressure: 2.0
● Screen Navigation: 1.6
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 2.0
● Closeout & Recovery: 1.4
● Deflections / Disruption: 2.0
● Steal Timing: 0.8
● Foul Discipline: 0.6
Team Defense: 11.4
● Help & Rotation: 3.4
● No-3s Discipline (stunts/recover): 2.2
● Low-Man / Tag: 2.0
● Communication / QB: 2.0
● Rim Protection Support: 0.8
● Charges / Physicality: 1.0
Rebounding: 6.6
● Defensive Rebounding: 3.2
● Box Outs: 2.2
● Rebound Range/Tracking: 0.8
● Hands/Secure: 0.4
TOOLS (TKR): 14 (defense tools only)
● Lateral Quickness: 4.4
● Length: 4.2
● Strength: 3.0
● Height: 2.4
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 0.8

FULL-COURT PRESS — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
POA Defense: 10.8 (traps/scramble, not true POA pressure)
● Ball Pressure: 1.0
● Screen Navigation: 1.0
● Containment / Angle: 1.6
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.2
● Deflections / Disruption: 2.0
● Steal Timing: 0.4
● Foul Discipline: 1.0
Team Defense: 15.1
● Help & Rotation: 4.4
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 3.8
● Communication / QB: 2.6
● Rim Protection Support: 0.9
● Charges / Physicality: 0.6
Rebounding: 10.1
● Defensive Rebounding: 5.6
● Box Outs: 3.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 18 (defense tools only)
● Height: 4.6
● Length: 4.6
● Strength: 5.2
● Lateral Quickness: 3.6
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.7
● Processing Under Pressure: 0.8
● Turnover Decision Quality: 0.5

FULL-COURT PRESS — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
POA Defense: 6.6 (press backline: contain + discipline)
● Containment / Angle (in space): 2.0
● Screen Navigation (coverage): 1.2
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.4
● Foul Discipline: 2.2
Team Defense: 24.2
● Rim Protection / Shot Blocking: 8.5
● Help & Rotation: 5.5
● Low-Man / Tag: 4.0
● Communication / QB: 3.2
● No-3s Discipline (stunts/recover): 1.5
● Charges / Physicality: 1.5
Rebounding: 13.2
● Defensive Rebounding: 7.4
● Box Outs: 3.8
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.0
● Length: 6.0
● Strength: 5.5
● Lateral Quickness: 2.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

JUNK — Neutral (ALL POSITIONS, COLLEGE)
TOTAL-PLAYER WEIGHTS ONLY
(Base Buckets + defense-only Tools: Height/Length/Strength/Lateral Quickness + defense-only
IQ: Decision Speed / Turnover Decision Quality / Processing Under Pressure)
JUNK — POINT GUARD (PG)
Base Buckets: OKR 56 | DKR 28 | TKR 10 | IQKR 6
DEFENSE (DKR): 28
Team Defense: 14.0 (game-plan execution + rotations)
● Help & Rotation: 3.6
● No-3s Discipline (deny/top-lock): 2.8
● Communication / QB: 3.0
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.0
● Charges / Physicality: 1.4
POA Defense: 8.4 (situational stops, not constant pressure)
● Containment / Angle: 2.2
● Closeout & Recovery: 2.0
● Denial / Off-ball Pressure: 1.2
● Ball Pressure: 0.8
● Screen Navigation: 0.6
● Deflections / Disruption: 1.0
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 5.6
● Defensive Rebounding: 2.4
● Box Outs: 1.8
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.4
TOOLS (TKR): 10 (defense tools only)
● Height: 2.0
● Length: 3.0
● Strength: 2.0
● Lateral Quickness: 3.0

IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.4
● Turnover Decision Quality: 1.4

JUNK — SHOOTING GUARD (SG)
Base Buckets: OKR 58 | DKR 26 | TKR 12 | IQKR 4
DEFENSE (DKR): 26
Team Defense: 13.0
● Help & Rotation: 3.2
● No-3s Discipline (deny/top-lock): 2.6
● Communication / QB: 2.6
● Low-Man / Tag: 2.2
● Rim Protection Support: 1.2
● Charges / Physicality: 1.2
POA Defense: 6.5
● Containment / Angle: 1.6
● Closeout & Recovery: 1.8
● Denial / Off-ball Pressure: 0.8
● Ball Pressure: 0.6
● Screen Navigation: 0.4
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 6.5
● Defensive Rebounding: 3.0
● Box Outs: 2.0
● Rebound Range/Tracking: 1.0
● Hands/Secure: 0.5
TOOLS (TKR): 12 (defense tools only)
● Height: 2.4
● Length: 3.6
● Strength: 2.4
● Lateral Quickness: 3.6
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.4
● Processing Under Pressure: 1.6
● Turnover Decision Quality: 1.0

JUNK — SMALL FORWARD (SF)
Base Buckets: OKR 52 | DKR 30 | TKR 14 | IQKR 4
DEFENSE (DKR): 30
Team Defense: 15.6
● Help & Rotation: 3.8
● No-3s Discipline (deny/top-lock): 3.0
● Communication / QB: 3.0
● Low-Man / Tag: 3.0
● Rim Protection Support: 1.8
● Charges / Physicality: 1.0
POA Defense: 6.0
● Containment / Angle: 1.4
● Closeout & Recovery: 1.8
● Denial / Off-ball Pressure: 0.8
● Ball Pressure: 0.3
● Screen Navigation: 0.4
● Deflections / Disruption: 1.0
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 8.4
● Defensive Rebounding: 4.2
● Box Outs: 2.6
● Rebound Range/Tracking: 1.1
● Hands/Secure: 0.5
TOOLS (TKR): 14 (defense tools only)
● Height: 2.8
● Length: 4.2
● Strength: 3.5
● Lateral Quickness: 3.5
IQ (IQKR): 4 (defense IQ only)
● Decision Speed: 1.2
● Processing Under Pressure: 1.8
● Turnover Decision Quality: 1.0

JUNK — POWER FORWARD (PF)
Base Buckets: OKR 44 | DKR 36 | TKR 18 | IQKR 2
DEFENSE (DKR): 36
Team Defense: 19.8
● Help & Rotation: 5.0
● No-3s Discipline (deny/top-lock): 3.6
● Communication / QB: 3.2
● Low-Man / Tag: 4.4
● Rim Protection Support: 2.6
● Charges / Physicality: 1.0
POA Defense: 5.4
● Containment / Angle: 1.2
● Closeout & Recovery: 1.6
● Denial / Off-ball Pressure: 0.6
● Ball Pressure: 0.2
● Screen Navigation: 0.3
● Deflections / Disruption: 1.2
● Steal Timing: 0.2
● Foul Discipline: 0.1
Rebounding: 10.8
● Defensive Rebounding: 6.0
● Box Outs: 3.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.6
TOOLS (TKR): 18 (defense tools only)
● Height: 4.5
● Length: 5.0
● Strength: 5.0
● Lateral Quickness: 3.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.5
● Processing Under Pressure: 0.9
● Turnover Decision Quality: 0.6

JUNK — CENTER (C)
Base Buckets: OKR 34 | DKR 44 | TKR 20 | IQKR 2
DEFENSE (DKR): 44
Team Defense: 26.4
● Rim Protection / Shot Blocking: 9.0
● Help & Rotation: 5.8
● Low-Man / Tag: 5.0
● Communication / QB: 3.6
● No-3s Discipline (deny/top-lock): 2.0
● Charges / Physicality: 1.0
POA Defense: 3.6
● Closeout & Recovery: 1.0
● Containment / Angle: 0.8
● Screen Navigation: 0.2
● Ball Pressure: 0.1
● Denial / Off-ball Pressure: 0.3
● Deflections / Disruption: 0.8
● Steal Timing: 0.1
● Foul Discipline: 0.3
Rebounding: 14.0
● Defensive Rebounding: 8.0
● Box Outs: 4.0
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 20 (defense tools only)
● Height: 6.5
● Length: 6.5
● Strength: 5.5
● Lateral Quickness: 1.5
IQ (IQKR): 2 (defense IQ only)
● Decision Speed: 0.4
● Processing Under Pressure: 1.0
● Turnover Decision Quality: 0.6

COACH K
COACH K — POINT GUARD (PG)
Buckets: OKR 62 | DKR 24 | TKR 6 | IQKR 8
DEFENSE (DKR): 24
Team Defense: 10.8
● Help & Rotation: 3.0
● No-3s Discipline (stunts/recover): 3.0
● Low-Man / Tag: 2.0
● Communication / QB: 1.6
● Charges / Physicality: 1.2
POA Defense: 9.6
● Ball Pressure: 2.0
● Screen Navigation: 2.4
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.2
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.6
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 3.6
● Defensive Rebounding: 1.6
● Box Outs: 1.0
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.4
TOOLS (TKR): 6 (defense tools only)
● Lateral Quickness: 3.2
● Length: 1.3
● Strength: 1.0
● Height: 0.5
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 3.2
● Processing Under Pressure: 2.6
● Turnover Decision Quality: 2.2

COACH K — SHOOTING GUARD (SG)
Buckets: OKR 64 | DKR 22 | TKR 8 | IQKR 6
DEFENSE (DKR): 22
Team Defense: 9.9
● Help & Rotation: 2.6
● No-3s Discipline (stunts/recover): 2.8
● Low-Man / Tag: 1.8
● Communication / QB: 1.5
● Charges / Physicality: 1.2
POA Defense: 8.8
● Ball Pressure: 1.6
● Screen Navigation: 2.0
● Containment / Angle: 1.8
● Denial / Off-ball Pressure: 1.2
● Closeout & Recovery: 1.0
● Deflections / Disruption: 0.6
● Steal Timing: 0.4
● Foul Discipline: 0.2
Rebounding: 3.3
● Defensive Rebounding: 1.4
● Box Outs: 1.0
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.3
TOOLS (TKR): 8 (defense tools only)
● Lateral Quickness: 3.2
● Length: 2.2
● Strength: 1.8
● Height: 0.8
IQ (IQKR): 6 (defense IQ only)
● Decision Speed: 2.2
● Processing Under Pressure: 2.0
● Turnover Decision Quality: 1.8

COACH K — SMALL FORWARD (SF)
Buckets: OKR 48 | DKR 34 | TKR 10 | IQKR 8
DEFENSE (DKR): 34
Team Defense: 15.3
● Help & Rotation: 4.0
● No-3s Discipline (stunts/recover): 4.0
● Low-Man / Tag: 3.0
● Communication / QB: 2.2
● Charges / Physicality: 2.1
POA Defense: 11.9
● Ball Pressure: 1.6
● Screen Navigation: 1.8
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.6
● Closeout & Recovery: 2.2
● Deflections / Disruption: 1.3
● Steal Timing: 0.8
● Foul Discipline: 0.6
Rebounding: 6.8
● Defensive Rebounding: 3.4
● Box Outs: 2.0
● Rebound Range/Tracking: 0.9
● Hands/Secure: 0.5
TOOLS (TKR): 10 (defense tools only)
● Lateral Quickness: 3.0
● Length: 3.0
● Strength: 2.5
● Height: 1.5
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.8
● Processing Under Pressure: 3.0
● Turnover Decision Quality: 2.2
COACH K — POWER FORWARD (PF)

Buckets: OKR 44 | DKR 36 | TKR 12 | IQKR 8
DEFENSE (DKR): 36
Team Defense: 18.0
● Help & Rotation: 5.0
● No-3s Discipline (stunts/recover): 4.0
● Low-Man / Tag: 4.0
● Communication / QB: 2.6
● Charges / Physicality: 2.4
POA Defense: 12.6
● Ball Pressure: 1.0
● Screen Navigation: 1.4
● Containment / Angle: 2.0
● Denial / Off-ball Pressure: 1.4
● Closeout & Recovery: 2.6
● Deflections / Disruption: 1.6
● Steal Timing: 0.6
● Foul Discipline: 2.0
Rebounding: 5.4
● Defensive Rebounding: 2.8
● Box Outs: 1.6
● Rebound Range/Tracking: 0.6
● Hands/Secure: 0.4
TOOLS (TKR): 12 (defense tools only)
● Lateral Quickness: 2.4
● Length: 3.6
● Strength: 3.6
● Height: 2.4
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.6
● Processing Under Pressure: 3.0
● Turnover Decision Quality: 2.4
COACH K — CENTER (C)

Buckets: OKR 30 | DKR 48 | TKR 14 | IQKR 8
DEFENSE (DKR): 48
Team Defense: 28.8
● Rim Protection / Shot Blocking: 10.0
● Help & Rotation: 5.5
● Communication / QB: 4.3
● No-3s Discipline (stunts/recover): 3.5
● Low-Man / Tag: 3.5
● Charges / Physicality: 2.0
POA Defense: 7.2 (coverage + contain in space, not pressure)
● Screen Navigation (coverage execution): 1.2
● Containment / Angle: 1.6
● Closeout & Recovery: 0.8
● Deflections / Disruption: 0.6
● Foul Discipline: 3.0
Rebounding: 12.0
● Defensive Rebounding: 6.8
● Box Outs: 3.2
● Rebound Range/Tracking: 1.2
● Hands/Secure: 0.8
TOOLS (TKR): 14 (defense tools only)
● Height: 4.0
● Length: 4.5
● Strength: 3.5
● Lateral Quickness: 2.0
IQ (IQKR): 8 (defense IQ only)
● Decision Speed: 2.0
● Processing Under Pressure: 3.2
● Turnover Decision Quality: 2.8



# BADGES

Badges

BADGES — COLLEGE v1 (LOCKED)
Bronze: +0.5 KR
Silver: +1.0 KR
Gold: +1.5 KR
Total badge lift cap: +3.5 KR
Badge KR Lift Meaning (College v1)
Level
Bronze +0.5 High-major weapon (certified advantage skill)
Silver +1.0 High-major major-weapon (reliable schematic edge)
Gold +1.5 Elite high-major weapon (outlier skill that drives game plans)
Global Tier Gates (once)
● Bronze: Skill KR ≥ 90 AND each required trait ≥ 90
● Silver: Skill KR ≥ 94 AND each required trait ≥ 94
● Gold: Skill KR ≥ 97 AND each required trait ≥ 97
● Data-layer rule: each required trait must be scored (non-null) in the active layer
PRO — Global Tier Gates (once)
Bronze: Skill KR ≥ 93 AND each required trait ≥ 93
Silver: Skill KR ≥ 96 AND each required trait ≥ 96
Gold: Skill KR ≥ 98 AND each required trait ≥ 98

SHOOTING BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
1) Spot-Up Sniper
● Skill KR gate: Shooting KR
● Required traits: 3PT Spot-Up
● Tools gates: none
● Data-layer gate: 3PT Spot-Up must be scored (non-null)
○ Box-score: OK if scored via PROXY
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Movement Shooter
● Skill KR gate: Shooting KR
● Required traits: 3PT Movement
● Tools gates: none
● Data-layer gate: 3PT Movement must be scored (non-null)
○ Box-score: only if your box-score layer actually scores it (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Pull-Up Shotmaker
● Skill KR gate: Shooting KR
● Required traits: 3PT Pull-Up, Midrange Shotmaking
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: only if both are scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Limitless Range
● Skill KR gate: Shooting KR
● Required traits: 3PT Deep Range
● Tools gates: none
● Data-layer gate: 3PT Deep Range must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Free Throw Bank
● Skill KR gate: Shooting KR
● Required traits: Free Throw
● Tools gates: none
● Data-layer gate: Free Throw must be scored (non-null)
○ Box-score: yes (standard)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

FINISHING BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
1) Rim Pressure
● Skill KR gate: Finishing KR
● Required traits: Rim Pressure
● Tools gates: none
● Data-layer gate: Rim Pressure must be scored (non-null)
○ Box-score: OK if scored via PROXY
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Whistle
● Skill KR gate: Finishing KR
● Required traits: Foul Draw, Rim Pressure
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: OK only if both are scored in box-score (Rim Pressure via PROXY is
fine; Foul Draw must also be scored/non-null)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Fearless Finisher
● Skill KR gate: Finishing KR
● Required traits: Contact Finishing
● Tools gates: Strength (gate, not a trait)
● Data-layer gate:
○ Contact Finishing must be scored (non-null)
○ Strength must be scored (non-null)
○ Box-score: eligible only if Contact Finishing + Strength are both scored in
box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Vertical Finisher
● Skill KR gate: Finishing KR
● Required traits: Vertical Finishing
● Tools gates: none
● Data-layer gate: Vertical Finishing must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Touch Artist
● Skill KR gate: Finishing KR
● Required traits: Touch / Craft
● Tools gates: none
● Data-layer gate: Touch / Craft must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
PLAYMAKING BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Advantage Creator
● Skill KR gate: Playmaking KR
● Required traits: Advantage Creation
● Tools gates: none
● Data-layer gate: Advantage Creation must be scored (non-null)
○ Box-score: only if scored in box-score
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Dimer
● Skill KR gate: Playmaking KR
● Required traits: Passing Execution
● Tools gates: none
● Data-layer gate: Passing Execution must be scored (non-null)
○ Box-score: OK if your box-score layer scores it (common)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Needle Threader
● Skill KR gate: Playmaking KR
● Required traits: Advantage Passing
● Tools gates: none
● Data-layer gate: Advantage Passing must be scored (non-null)
○ Box-score: only if scored in box-score
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

4) Floor General
● Skill KR gate: Playmaking KR
● Required traits (base): Passing Vision
● Additional required traits: Correct Read Rate (IQ trait gate for top tiers)
● Tools gates: none
● Data-layer gate: required traits must be scored (non-null) in the active data layer:
○ Bronze tier: Passing Vision must be scored (non-null)
○ Silver/Gold tiers: Passing Vision and Correct Read Rate must both be scored
(non-null)
○ Box-score: only eligible if those traits are scored in box-score (usually not for
Correct Read Rate)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Ball Security
● Skill KR gate: Playmaking KR
● Required traits: Ball Security
● Tools gates: none
● Data-layer gate: Ball Security must be scored (non-null)
○ Box-score: OK if your box-score layer scores it (common)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

POA DEFENSE BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Clamps
● Skill KR gate: POA Defense KR
● Required traits: Containment, Ball Pressure
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: eligible only if both are scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Screen Navigator
● Skill KR gate: POA Defense KR
● Required traits: Screen Navigation
● Tools gates: none
● Data-layer gate: Screen Navigation must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Interceptor
● Skill KR gate: POA Defense KR
● Required traits: Deflections
● Tools gates: none
● Data-layer gate: Deflections must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Ball Hawk
● Skill KR gate: POA Defense KR
● Required traits: Steal Timing
● Tools gates: none
● Data-layer gate: Steal Timing must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Steal Timing (often yes via
steals proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Discipline
● Skill KR gate: POA Defense KR
● Required traits: Foul Discipline
● Tools gates: none
● Data-layer gate: Foul Discipline must be scored (non-null)
○ Box-score: eligible if scored via fouls proxy (often yes)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
TEAM DEFENSE BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Anchor
● Skill KR gate: Team Defense KR
● Required traits: Rim Protection
● Tools gates: none
● Data-layer gate: Rim Protection must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Rim Protection (often yes
via proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Low-Man Rotator
● Skill KR gate: Team Defense KR
● Required traits: Help & Rotation
● Tools gates: none
● Data-layer gate: Help & Rotation must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Closeout Pro
● Skill KR gate: Team Defense KR
● Required traits: Closeout Execution
● Tools gates: none
● Data-layer gate: Closeout Execution must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

4) Defensive QB
● Skill KR gate: Team Defense KR
● Required traits: Communication & QB
● Tools gates: none
● Data-layer gate: Communication & QB must be scored (non-null)
○ Box-score: only if scored in box-score (no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
5) Switchable
● Skill KR gate: Team Defense KR
● Required traits: Versatility
● Tools gates: none
● Data-layer gate: Versatility must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

REBOUNDING BADGES — COLLEGE v1 (gates only; uses Global Tier
Gates)
1) Rebound Chaser
● Skill KR gate: Rebounding KR
● Required traits: Defensive Rebounding, Rebound Range
● Tools gates: none
● Data-layer gate: both traits must be scored (non-null) in the active data layer
○ Box-score: eligible only if both are scored in box-score (Defensive Rebounding
often yes via proxy; Rebound Range usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Boxout Beast
● Skill KR gate: Rebounding KR
● Required traits: Box-Out
● Tools gates: none
● Data-layer gate: Box-Out must be scored (non-null)
○ Box-score: only if scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Offensive Glass
● Skill KR gate: Rebounding KR
● Required traits: Offensive Rebounding
● Tools gates: none
● Data-layer gate: Offensive Rebounding must be scored (non-null)
○ Box-score: eligible if your box-score layer scores Offensive Rebounding (often
yes via proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Strong Hands
● Skill KR gate: Rebounding KR
● Required traits: Hands
● Tools gates: none
● Data-layer gate: Hands must be scored (non-null)
○ Box-score: eligible only if your box-score layer scores Hands (often no / weak
proxy)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

IQ BADGES — COLLEGE v1 (gates only; uses Global Tier Gates)
NOTE: do not label these “film-only.”
These are Non-Box-Score Scored — eligible in any layer where these traits are scored
(Synergy / PlayVision / KaNeXT-tag, etc.).
1) Fast Processor
● Skill KR gate: IQ KR
● Required traits: Decision Speed
● Tools gates: none
● Data-layer gate: Decision Speed must be scored (non-null)
○ Box-score: not eligible unless you score Decision Speed in box-score (usually
no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
2) Elite Shot Selector
● Skill KR gate: IQ KR
● Required traits: Shot Selection Quality
● Tools gates: none
● Data-layer gate: Shot Selection Quality must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
3) Low Mistake Rate
● Skill KR gate: IQ KR
● Required traits: Turnover Decision Quality
● Tools gates: none
● Data-layer gate: Turnover Decision Quality must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there
4) Advantage Converter
● Skill KR gate: IQ KR
● Required traits: Advantage Conversion
● Tools gates: none
● Data-layer gate: Advantage Conversion must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there

5) Role Discipline
● Skill KR gate: IQ KR
● Required traits: Role Discipline
● Tools gates: none
● Data-layer gate: Role Discipline must be scored (non-null)
○ Box-score: not eligible unless scored in box-score (usually no)
○ Synergy / PlayVision / KaNeXT-tag: OK if scored there



# OVERRIDES

Overrides

OVERRIDES
v3 — AMENDED (No Gravity Redefined)
AMENDMENT LOG (v2 → v3)
Change 1 — No Gravity (Pro Negative Override) redefined. Trigger changed from vague
"consistent defensive sag; below-baseline gravity/attention" to a numeric multi-condition gate
requiring ALL four gravity types (perimeter, rim, short-roll, post) to be absent. This prevents the
override from penalizing rim-runners, roll men, playmaking bigs, and post scorers who
command real defensive attention through non-perimeter channels.
Change 2 — Anti-Stacking reference added. No Gravity override is suppressed when Range
Gap system risk is active for the same player (per System Risks v3 Anti-Stacking Rule).
All other overrides unchanged from v2.
Purpose
Overrides capture rare, real-world basketball realities that are not fully expressed by traits,
archetypes, badges, or system risks. They are exceptions, not features.
Authority
Overrides modify Final KR only. They do not change trait scores, archetypes, badges,
confidence, or system fit logic.
Application Order
Overrides are applied after Base KR, Badges, System Fit, and System Risks. They are the final
correction layer before Final KR lock.
Stacking Rules

Maximum one positive override per player. At Pro, negative overrides always apply and cannot
be overridden by positives. Positives and negatives do not stack against each other — if a
negative triggers, it applies regardless of any positive qualification.
[v3 ADDITION] Anti-Stacking with System Risks: No Gravity (negative override) is suppressed
when Range Gap (system risk) is active for the same player. See System Risks v3.
Determinism
Override application is rule-based, deterministic, and auditable. If conditions are met, the
override applies. If conditions are not met, it does not. There is no discretion inside the engine.
COLLEGE OVERRIDES (Positive Only — Max 1 Applies)
Unchanged from v2.
1) True 7-Footer — +2.0 to +5.0 KR (scaled)
Trigger: Height ≥ 7'0
KR Delta:
● 7'0–7'0.75 → +2.0
● 7'1–7'1.75 → +3.0
● 7'2–7'2.75 → +4.0
● 7'3+ → +5.0
2) Jumbo Initiator — +1.0 KR
Triggers: Height ≥ 6'6, Usage ≥ 20%, AST% ≥ 20, ≥ 50% possessions as primary initiator
Blocked by: Turnover Risk (Major), Decision-Making Collapse
3) Stretch 5 — +1.0 KR
Triggers: Height ≥ 6'9, ≥ 50% minutes at C, 3PA ≥ 7.0 / 100, 3P% ≥ 33%
Blocked by: No Gravity (Major)
4) Vertical Rim Threat — +1.0 KR
Triggers: ≥ 20% of FGA are dunks/lobs, Rim FG% ≥ 65%, ≥ 3.0 lob/dunk attempts / 100

5) Connector Wing — +1.0 KR
Triggers: Height 6'4–6'8, Usage ≤ 16%, AST% ≥ 12, DREB% ≥ 10, On/Off Net Rating Swing ≥
+5
6) Micro-5 (College-Only) — +1.0 KR
Triggers: Height < 6'8, ≥ 70% minutes at C, DREB% ≥ 15, ≥ 5 rim contests / 100, team
defensive rating improves on floor
Blocked by: Foul Machine (Major), Rim Protection below level baseline
Expires before Pro.
7) Small Bucket Getter (College-Only) — +0.75 KR
Triggers: Height ≤ 6'1, Points ≥ 25 / 100, Usage ≥ 22%, TS% ≥ league average, no Severe
Pull-Up Void
Blocked by: Turnover Risk (Major), No Gravity (Major)
8) Undersized Defensive Guard (College-Only) — +0.75 KR
Triggers: Height ≤ 6'1, Containment ≥ 75, Screen Navigation ≥ baseline, ≥ 4 rim contests / 100,
Opp FG% at rim ≤ −5% vs baseline
Blocked by: Switch Liability (Major), Foul Machine (Major)
PRO OVERRIDES — Positive (Max 1 Applies) — Each +1.0
KR
Unchanged from v2.
1) Jumbo Initiator (Pro) — +1.0 KR
Triggers: Height ≥ 6'6, AST ≥ 8.0 / 100, Usage ≥ 20%, ≥ 50% minutes as primary initiator
2) Stretch 5 (Pro) — +1.0 KR
Triggers: Height ≥ 6'9, ≥ 50% minutes at C, 3PA ≥ 12.0 / 100, 3P% ≥ 36%
3) Switch Big (Pro) — +1.0 KR

Triggers: Height ≥ 6'8, Lateral Quickness ≥ 75, Switch volume ≥ 8 / 100, Switch PPP ≤ 0.95
4) High-Movement Shooter (Pro) — +1.0 KR
Triggers: Off-screen 3PA ≥ 8 / 100, 3P% ≥ 37%, ≥ 50% minutes at SG/SF
PRO OVERRIDES — Negative (Always Apply, Cannot Be
Overridden)
1) No Gravity — −1.0 KR [AMENDED v3]
[AMENDED v3] Trigger redefined to measure total defensive attention across all gravity types.
Trigger: ALL of the following must be true:
● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 OR (3P% < 20% AND 3PA < 2.0 per
100)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% in screener/post/short-roll actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
Anti-Stacking: Suppressed when Range Gap system risk is active for same player.
2) Rim Pressure Limitation — −1.0 KR
Trigger: Rim attempts materially below positional baseline; no foul draw or collapse effect
Unchanged from v2.
3) Switch Liability — −1.0 KR
Trigger: Switch PPP ≥ 1.05 (with required switch volume)
Unchanged from v2.
4) Tweener (No Positional Home) — −1.5 KR
Trigger: Guard skills in wing body, undersized big with no switch value, or wing who can't
defend wings or space
Unchanged from v2.

Governance
Any change to override definitions, triggers, KR deltas, stacking rules, or blocking relationships
requires documentation, versioning, and approval.
v1 → v2: Initial locked structure. v2 → v3: No Gravity redefined (total gravity gate), Anti-Stacking
reference added.



# SYSTEM RISKS

System Risks

SYSTEM RISKS
v3.2 — AMENDED (Tiered Severity + Position-Scaled Range Gap + Suppression
Adjustment Protocol + Reduced Pro Minors)
AMENDMENT LOG
v2 → v3: Tiered severity, No Gravity redefinition, Anti-Stacking Rule.
v3 → v3.1: Position-scaled Range Gap.
v3.1 → v3.2: Reduced Pro Minor penalties (−2.0 → −1.0). Formal Suppression Adjustment
protocol for system risks added.
Change 6 — Pro Minor penalties reduced from −2.0 to −1.0. Pro Minors now match College
Minors. Rationale: Minor risks are by definition "marginal but measurable." The trait pipeline at
Pro already does more work than at College through heavier position-specific weighting — the
pipeline catches most of the damage proportionally. The Minor flag marks the issue; it should
not materially alter a player's value. Under the prior −2.0 penalty, two Pro Minors (−4.0) equaled
a Tier 1 Major — meaning two marginal issues produced a scheme-breaking-level penalty. That
was structurally wrong. At −1.0, even three stacked Minors (−3.0) remain below a single Tier 1
Major (−4.0), which correctly reflects the severity hierarchy.
Change 7 — Suppression Adjustment protocol formalized. When a system risk trigger is
met but Tier 3 evidence demonstrates the production driving the trigger is context-suppressed
rather than skill-representative, the system risk can be flagged as "Suppression-Adjusted" and
the penalty reduced or removed. This formalizes a process that was being applied informally,
ensuring consistent treatment across all players.
Purpose
System Risks identify specific weaknesses that break or limit how a system functions at the
team level. They capture damage that individual trait scores alone do not — spacing collapse,
scheme incompatibility, possession-level contagion, and role inflexibility.
System Risks are not general player weaknesses. If a weakness is already proportionally
punished by low trait scores through position weighting, it is not a system risk. System Risks
exist only where the team-level damage exceeds what the individual KR penalty captures.

Severity Levels
Three severities at each level: Tier 1 Major (Scheme-Breaking), Tier 2 Major
(Scheme-Limiting), and Minor.
KR Impact
Severity College Pro Category
Tier 1 Major −2.0 −4.0 Cannot be schemed
(Scheme-Breaking) around
Tier 2 Major Varies by risk (see Varies by risk (see Manageable with roster
(Scheme-Limiting) below) below) construction
Minor −1.0 −1.0 Marginal but measurable
Tier 2 Major — Default Penalties (non-position-scaled risks): College: −1.5 | Pro: −2.5
Tier 2 Major — Range Gap (position-scaled): See Range Gap section below.
Penalties are additive. Non-position-scaled penalties apply uniformly regardless of position or
archetype. Position-scaled penalties (Range Gap only) vary by position as specified.
Anti-Stacking Rule
If Range Gap (any severity) is active for a player, No Gravity cannot also fire for that
player. Range Gap is the higher-authority penalty for shooting-related spacing damage and fully
subsumes the gravity component.
This rule applies at both College and Pro. It is evaluated after all individual system risk triggers
are checked but before final KR application.
Suppression Adjustment Protocol [NEW in v3.2]
Purpose: Some system risk triggers are met based on production data that is
context-suppressed — the player's environment (roster, role, injury, coaching) artificially inflates
the metric that triggers the risk. The Suppression Adjustment protocol provides a governed
mechanism to reduce or remove penalties when evidence demonstrates the trigger is
context-driven rather than skill-driven.
When it applies: A system risk trigger is formally met by the production data, BUT Tier 3
evidence (and in some cases Tier 1 data from other contexts) demonstrates that the underlying
skill is not representative of the trigger.
Evidence requirements (must meet at least 2 of 4):

1. Multi-context contradiction: The player's pre-college, international, or prior-level data
shows the metric at a materially different level than the triggering context. Example:
player's pre-college AST/TO is consistently clean (3.5+ ratio) across 3+ competitions,
but college AST/TO triggers Turnover Risk due to sole-creator burden.
2. Role suppression confirmation: The player's role in the triggering context is
demonstrably extreme — sole offensive option, no secondary creator, heavy
double-team attention — and the metric in question is directly affected by that role.
Confirmed by roster context, coaching testimony, or opponent game-planning evidence.
3. Healthy-context data divergence: When the player was healthy, in rhythm, or in a
favorable lineup, the metric was materially different. Example: 5-game healthy stretch
shows TOV% of 12% vs season average of 18% driven by games played through injury.
4. Pro context projection: The specific context causing the trigger will not exist at the
professional level. Example: no NBA team will ask a SF to carry 32% usage as the sole
creator — the usage and role that drive the turnover rate will not replicate.
Adjustment levels:
● Full removal (penalty → 0): All 4 evidence requirements met, OR requirements 1 + 4
met with strong Tier 1 data from other contexts. The system risk is flagged as
"Suppression-Adjusted: Removed" with full evidence citation.
● 50% reduction (penalty halved): 2 of 4 requirements met. The system risk is flagged
as "Suppression-Adjusted: Reduced" with evidence citation and disclosure of which
requirements were not met.
● No adjustment: Fewer than 2 requirements met, or the evidence is ambiguous. The
system risk applies at full penalty. The suppression argument is noted in the evaluation
but does not modify the output.
Governance rules:
● Suppression Adjustment does not modify trait scores. It modifies system risk penalties
only.
● Every Suppression Adjustment must cite specific evidence for each requirement met.
● Suppression Adjustment is deterministic: same evidence → same adjustment.
● The adjustment is disclosed in the evaluation output. It is never silent.
● If new data arrives that contradicts the suppression evidence, the adjustment is
reversed.

Relationship to trait-level suppression: Trait-level Suppression Detection (in the Player
Evaluation Pipeline) modifies trait scores directly. System Risk Suppression Adjustment
modifies risk penalties. They operate on different layers and do not interact. A player can have
both trait suppression (e.g., Brown's shooting) and risk suppression (e.g., Dybantsa's turnovers)
applied independently.
What System Risks Do
Reduce Overall KR. Reduce System Fit KR. Force separation between similar players. Expose
system-breaking problems that trait scores under-punish.
What System Risks Do Not Do
Change trait scores. Change cluster weights. Override badge logic. Directly assign or remove
archetypes.
Application Order
System Risks are evaluated after trait scoring, position weighting, and Base KR computation.
Suppression Adjustment is evaluated during risk assessment (before final penalty application).
Risks are applied before Overrides.
COLLEGE TIER 1 MAJOR SYSTEM RISKS (−2.0 KR) — 5
Total
Scheme-Breaking risks that cannot be managed through roster construction.
1. Turnover Risk (Major)
Trigger: TOV% ≥ 20% OR turnovers ≥ 6.0 per 100 touches
System damage: Possession hemorrhage affects pace, transition defense exposure, and team
offensive rhythm. Turnovers are contagious — they compress shot clock behavior and erode
trust in ball movement.
2. Defensive Target
Trigger: Opponent PPP vs player (ISO + PnR) ≥ 1.15 OR on-court defensive rating −6.0 vs
team baseline

System damage: Opponents game-plan to attack one player. Team must over-help, rotations
break, defensive scheme identity collapses around protection duty.
3. Switch Liability
Trigger: Versatility trait < 55 AND Lateral Quickness trait below positional average
System damage: Switch-based defensive schemes cannot run with this player on the floor.
Binary system-breaking issue.
4. Foul Machine
Trigger: Foul Discipline trait < 55 (POA) AND Team Foul Discipline trait < 55 OR fouls ≥ 6.0 per
100 possessions
System damage: Early bonus pressure changes how the entire defense can play. Substitution
crises shorten rotation. Opponents attack the foul-prone player to manufacture free throws for
the team.
5. Role Collapse
Trigger: Usage change ±20% → efficiency drop ≥ 15% OR starter → bench Net Rating ≤ −8.0
System damage: System cannot adjust around this player. Injuries, foul trouble, and matchup
shifts require role flexibility — this player breaks when their role changes.
COLLEGE TIER 2 MAJOR SYSTEM RISKS — 4 Total
Scheme-Limiting risks. Manageable through roster construction, play design, and
complementary personnel.
6. Range Gap [POSITION-SCALED]
Trigger: 3PT Spot-Up trait < 60 AND 3PA < 3.0 per 100 possessions
College Penalty (by position):
Positio Penalty
n
PG −2.0

SG −2.0
SF −1.5
PF −1.5
C −1.0
Anti-Stacking: If active, suppresses No Gravity for same player.
7. No Gravity
Trigger: ALL of the following must be true:
● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 possessions OR (3P% < 20% AND 3PA
< 2.0 per 100 possessions)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% when in screener/post/short-roll
actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
College Penalty: −1.5 (flat)
Anti-Stacking: Suppressed if Range Gap is active for same player.
8. Severe Undersize
Trigger: Height trait OR Length trait ≥ 4 inches below positional average
College Penalty: −1.5 (flat)
9. System Locked (Severe)
Trigger: Positive Net Rating in only 1 system type AND Net Rating swing ≤ −6.0 outside that
system
College Penalty: −1.5 (flat)
COLLEGE MINOR SYSTEM RISKS (−1.0 KR) — 5 Total
10. Limited Range
Trigger: 3PT Spot-Up trait 60–69 AND 3PA 3.0–4.5 per 100 possessions

System damage: Spacing is marginal. Defenses respect the shot inconsistently, creating
unreliable geometry for teammates.
11. Low Shooting Volume
Trigger: Total 3PA < 4.0 per 100 possessions OR wide-open 3s declined ≥ 25%
System damage: Even when the skill exists, declining open shots teaches defenses to sag.
Spacing benefit degrades over time as opponents adjust.
12. Elevated Turnover Risk
Trigger: TOV% 17–19% OR turnovers 4.5–5.9 per 100 touches
System damage: Weaker version of Major Turnover Risk. Possession leakage is manageable
but measurable.
13. Partial System Lock
Trigger: Positive Net Rating in ≤ 2 system types AND Net Rating variance ≥ 6.0
System damage: Weaker version of System Locked. Player functions in limited schemes,
reducing coaching flexibility.
14. Role Fragility
Trigger: Usage change ±15% → efficiency drop 10–14%
System damage: Weaker version of Role Collapse. Player survives small role shifts but
degrades under moderate adjustment.
PRO TIER 1 MAJOR SYSTEM RISKS (−4.0 KR) — 5 Total
Scheme-Breaking risks. Unchanged from v3.1.
1. Turnover Risk (Major)
Trigger: TOV% ≥ 17% OR turnovers ≥ 5.0 per 100 touches
2. Defensive Target
Trigger: Opponent PPP vs player ≥ 1.10 OR targeted on ≥ 20% of halfcourt actions

3. Switch Liability
Trigger: Versatility trait < 60 AND Lateral Quickness trait below positional pro baseline
4. Foul Machine
Trigger: Foul Discipline trait < 60 (POA) AND Team Foul Discipline trait < 60 OR fouls ≥ 5.5 per
100 possessions
5. Role Collapse
Trigger: Usage change ±15% → efficiency drop ≥ 12% OR rotation role change → Net Rating ≤
−6.0
PRO TIER 2 MAJOR SYSTEM RISKS — 4 Total
Scheme-Limiting risks. Unchanged from v3.1.
6. Range Gap [POSITION-SCALED]
Trigger: 3PT Spot-Up trait < 65 AND 3PA < 4.0 per 100 possessions
Pro Penalty (by position):
Positio Penalty
n
PG −3.0
SG −3.0
SF −2.5
PF −2.0
C −1.5
Anti-Stacking: If active, suppresses No Gravity for same player.
7. No Gravity
Trigger: ALL of the following must be true:

● (a) Perimeter gravity is zero: 3PA < 1.0 per 100 OR (3P% < 20% AND 3PA < 2.0 per
100)
● (b) Rim gravity is zero: Lob/dunk/roll attempts < 2.0 per 100 AND Rim FG% < 55%
● (c) Short-roll / playmaking gravity is zero: AST% < 8% in screener/post/short-roll actions
● (d) Post gravity is zero: Post-up frequency < 5% of possessions OR post-up PPP < 0.85
Pro Penalty: −2.5 (flat)
Anti-Stacking: Suppressed if Range Gap is active for same player.
8. Severe Undersize
Trigger: Height trait OR Length trait ≥ 3 inches below positional pro average
Pro Penalty: −2.5 (flat)
9. System Locked (Severe)
Trigger: Positive Net Rating in only 1 system AND Net Rating swing ≤ −5.0 outside it
Pro Penalty: −2.5 (flat)
PRO MINOR SYSTEM RISKS (−1.0 KR) — 5 Total
[AMENDED v3.2] Penalty reduced from −2.0 to −1.0. Matches College Minor severity.
10. Limited Range
Trigger: 3PT Spot-Up trait 65–74 AND 3PA 4.0–5.5 per 100 possessions
11. Low Shooting Volume
Trigger: Total 3PA < 5.0 per 100 possessions
12. Elevated Turnover Risk
Trigger: TOV% 14–16% OR turnovers 4.0–4.9 per 100 touches
13. Partial System Lock
Trigger: Positive Net Rating in ≤ 2 systems AND Net Rating variance ≥ 5.0
14. Role Fragility

Trigger: Usage change ±10% → efficiency drop 8–11%
POSITION-SCALED RANGE GAP — QUICK REFERENCE
Positio College Trigger College Pro Trigger Pro
n Penalty Penalty
PG Spot-Up < 60, 3PA < −2.0 Spot-Up < 65, 3PA < −3.0
3.0/100 4.0/100
SG Spot-Up < 60, 3PA < −2.0 Spot-Up < 65, 3PA < −3.0
3.0/100 4.0/100
SF Spot-Up < 60, 3PA < −1.5 Spot-Up < 65, 3PA < −2.5
3.0/100 4.0/100
PF Spot-Up < 60, 3PA < −1.5 Spot-Up < 65, 3PA < −2.0
3.0/100 4.0/100
C Spot-Up < 60, 3PA < −1.0 Spot-Up < 65, 3PA < −1.5
3.0/100 4.0/100
Note: Trigger thresholds are the same at all positions. Only the penalty magnitude varies.
TIER CLASSIFICATION RATIONALE
Tier 1 — Scheme-Breaking (−4.0 Pro / −2.0 College)
These risks represent problems that coaching staffs cannot scheme around regardless of
personnel. When Defensive Target fires, opponents will hunt that player every possession — no
lineup change fixes it. When Foul Machine fires, the team enters the bonus early — no play
design prevents it. When Switch Liability fires, the defensive scheme literally cannot function.
When Turnover Risk fires, possessions hemorrhage at a rate that corrupts team rhythm. When
Role Collapse fires, the player becomes unplayable in any adjusted context.
Tier 2 — Scheme-Limiting (−2.5 Pro / −1.5 College, or position-scaled for Range Gap)
These risks represent real costs that limit what schemes the team can run, but a smart coaching
staff can mitigate them with lineup construction, play design, and complementary personnel.
Minor (−1.0 at both levels)

These risks are marginal but measurable. They flag a real limitation without materially altering a
player's value. The trait pipeline handles the proportional damage through position weighting.
The Minor flag marks the issue for scouting awareness and development targeting. At −1.0,
even three stacked Minors (−3.0) remain below a single Tier 1 Major (−4.0), correctly preserving
the severity hierarchy.
SEVERITY SUMMARY TABLE
Severity Colleg Pro Max 3 stacked
e
Tier 1 Major −2.0 −4.0 −6.0 / −12.0
Tier 2 Major (flat) −1.5 −2.5 −4.5 / −7.5
Tier 2 Major (Range Gap PG/SG) −2.0 −3.0 N/A (only 1 Range Gap)
Tier 2 Major (Range Gap C) −1.0 −1.5 N/A
Minor −1.0 −1.0 −3.0 / −3.0
Governance
Any change to system risk definitions, triggers, severity levels, tier classifications,
position-scaling tables, stacking rules, or suppression adjustment protocol requires
documentation, versioning, and approval. All amendments are tracked in the Amendment Log at
the top of this document.
v1 → v2: Initial locked structure. v2 → v3: Tiered severity, No Gravity redefinition, Anti-Stacking
Rule. v3 → v3.1: Position-scaled Range Gap. v3.1 → v3.2: Reduced Pro Minors (−2.0 → −1.0),
formal Suppression Adjustment protocol.



# IMPACT MODIFIERS

Impact Modifiers

IMPACT MODIFIERS — v2 (LOCKED)
Purpose
KR measures how much a player impacts winning. Impact Modifiers classify the mode by which
that impact is produced. KR answers magnitude. Impact Modifiers answer method.
Inputs
All rate stats are per-possession / per-100 / % as noted:
● USG — usage rate (% possessions)
● AST% — assist percentage
● TOV% — turnover percentage
● TS% — true shooting %
● SelfCreate% — % of FGA that are self-created (off-dribble / unassisted)
● OnOff_Net — team net rating on-court minus off-court (per 100)
● 3PAr — 3PA / FGA
● 3P%
● FTr — FTA / FGA
● STL%
● BLK%
● REB%
Derived
ELS (Engine Load Score) = 0.60 × USG + 0.40 × AST%
v1 Note
v1 uses raw stats. v2 will move to KLVN-normalized inputs when per-metric normalization is
available.
Sample Gate
If MP < 200, label = UNCLASSIFIED (LOW SAMPLE).
Assignment Rules
One modifier max per player. Evaluate in strict precedence order. First match wins.
1. Primary Engine
2. Secondary Engine
3. Force Multiplier

4. Specialist Anchor
5. Else → Unclassified
Impact Modifiers do not alter KR values. They are classification labels consumed by System
Demand Profiles, simulation, and scouting.
1) Primary Engine
Definition: A player whose offensive impact is structurally required for team function. Offense is
organized around them. Removal produces a measurable structural drop.
Assign PRIMARY ENGINE if ALL conditions hold:
● ELS ≥ 24.0
● SelfCreate% ≥ 45
● TS% ≥ 52.0
● TOV% ≤ 20.0
● (OnOff_Net ≥ +5.0) OR (OnOff_Net ≥ +3.0 AND ELS ≥ 26.0)
2) Secondary Engine
Definition: A player who creates advantages but does not anchor the offense continuously.
Creates in bursts or as a secondary option.
Assign SECONDARY ENGINE if ALL conditions hold:
● ELS between 18.0 and 23.9
● SelfCreate% ≥ 35
● TS% ≥ 54.0
● TOV% ≤ 22.0
● OnOff_Net ≥ +3.0
3) Force Multiplier
Definition: A player whose impact is driven by efficiency, spacing, defense, and connective play.
Makes teammates better without needing the ball.
Assign FORCE MULTIPLIER if ALL conditions hold:
● USG ≤ 22.0
● TS% ≥ 56.0

● OnOff_Net ≥ +5.0
● MultiplierTriggers ≥ 2
Multiplier Triggers (count how many are true):
Shooting Gravity: (3PAr ≥ 0.35 AND 3P% ≥ 36.0) OR (3PAr ≥ 0.45 AND 3P% ≥ 34.0)
Rim / Foul Pressure: FTr ≥ 0.35 OR (SelfCreate% ≥ 40 AND FTr ≥ 0.25)
Defensive Playmaking: STL% ≥ 2.0 OR BLK% ≥ 3.0
Rebound Leverage: REB% ≥ 15.0
4) Specialist Anchor
Definition: A player whose impact is elite in one narrow domain and matchup-dependent.
Dominates one thing.
Assign SPECIALIST ANCHOR if ALL conditions hold:
● USG ≤ 20.0
● OnOff_Net ≥ +2.0
● Exactly one Elite Signal is true
Elite Signals (exactly one must be true):
● Rim Protector Anchor: BLK% ≥ 6.0
● POA Disruptor: STL% ≥ 3.0
● Rebound Enforcer: REB% ≥ 20.0
● Pure Spacer: 3PAr ≥ 0.55 AND 3P% ≥ 38.0
● Foul Magnet Finisher: FTr ≥ 0.50
If 2+ Elite Signals are true, player is not Specialist Anchor — reroute to Force Multiplier
evaluation (or Unclassified if FM gates fail).
Governance
Impact Modifiers are deterministic. Same inputs produce the same label every time. No learning,
tuning, or adaptation. Changes to thresholds require documentation, versioning, and approval.



# KLVN

KLVN

KLVN — Level Normalization Ladder + D1
Conference Class Mapping
Status: Canonical (Active)
Audience: Founder, Nexus intelligence layer, builders implementing normalization
Scope: Production normalization + cross-level KR translation using a single per-level lambda
(λ_level[L]).
1) Purpose (Locked)
KLVN exists to ensure player performance is comparable across competitive environments and
to prevent level/pace/sample-size effects from distorting evaluation. KLVN performs
normalization only and does not rank, value, or project players.
2) Determinism (Locked)
KLVN is fully deterministic: identical inputs must produce identical outputs.
3) Canonical Level Order (by λ weight)
Rule: Higher λ = higher competition density (harder environment).
Note: “professional” is intentionally excluded in v1 until pro sub-levels exist.
Rank Level Key λ_leve
l
1 ncaa_d1_high_majo 1.000
r
2 ncaa_d1_mid_major 0.958
3 ncaa_d1_low_major 0.917
4 ncaa_d2 0.875

5 njcaa_d1 0.833
6 naia 0.810
7 cccaa 0.765
8 njcaa_d2 0.750
9 ncaa_d3 0.667
10 njcaa_d3 0.625
11 uscaa 0.583
12 nccaa_d1 0.542
13 nccaa_d2 0.500
14 hs_prep_postgrad 0.450
4) D1 Major Class Mapping (NEW — Required for KLVN)
Goal: deterministically assign NCAA D1 teams to High / Mid / Low so they map into the correct
KLVN level keys.
4.1 Season-scoped rule (Locked)
Conference realignment changes over time, so the D1 Major Class mapping is season-scoped.
Create a table/object:
d1_conference_class_map[season_id][conference_key] = {high|mid|low}
For KLVN v1 (starting 2025–26), use the following baseline lists:
High-Major (HM) conferences
● ACC
● Big Ten
● Big 12
● SEC
● Big East
Mid-Major (MM) conferences

● American (AAC)
● Atlantic 10 (A-10)
● Mountain West (MWC)
● West Coast (WCC)
● Missouri Valley (MVC)
Low-Major (LM) conferences
● All other D1 conferences not in HM or MM
(Explicitly keep Sun Belt and Conference USA as LM in v1.)
4.2 Level key assignment rule (Locked)
If governing_body = NCAA and division = D1:
● If conference ∈ HM → level_key = ncaa_d1_high_major
● Else if conference ∈ MM → level_key = ncaa_d1_mid_major
● Else → level_key = ncaa_d1_low_major
If conference is missing/unknown:
● require manual d1_major_class input for that team-season or block KLVN
assignment until resolved.
5) Application Rule (v1 Simplification)
Legacy KLVN may define metric-specific multipliers λ[S,L].
KLVN v1 simplification (Locked):
● Use λ_level[L] as a single multiplier applied uniformly across production-derived
translation needs.
● Future KLVN v2 may expand to λ[S,L] by metric (points vs rebounds vs assists, etc.).

6) Governance / Change Control (Locked)
Any change to:
● level definitions
● λ constants
● D1 conference class lists / mapping table
● normalization logic
requires documentation, versioning, and explicit approval.

7) CRITICAL CLARIFICATION — KR IS UNIVERSAL, NOT LEVEL-CONVERTED (Added March 2026)

KLVN lambda normalizes INPUTS (production stats) during evaluation so that trait scoring is comparable across levels. It does NOT convert KR OUTPUTS from one level to another.

A player's KR is a single universal number. It does not change based on what level you're viewing from. There is no "HM-equivalent KR" or "MM-equivalent KR." The KR is the KR.

What changes across levels is the LEGEND INTERPRETATION of that KR. Each level has its own legend with different tier labels at different KR ranges. A KR of 85 maps to different tier labels at different levels:
- At D1 HM: 83–85 = Reliable Bench / Rotation Contributor
- At D1 MM: 85–87 = Solid Starter / Top-Five Rotation Lock
- At D1 LM: 84–87 = High-Impact Starter / Core Winner
- At D2: 82–85 = High-Impact Starter / Core Winner
- At NAIA: 82–85 = Franchise Anchor / Top All-American

One player. One KR. Multiple legend reads depending on level context.

HOW KLVN LAMBDA IS CORRECTLY USED:
- During evaluation: lambda adjusts raw production stats before trait scoring so that 20 PPG at NAIA is not treated the same as 20 PPG at D1 HM
- During legend interpretation: the player's KR is read against EACH level's legend to show what that number means at every level (the Level Tier Map in the Development Engine)

HOW KLVN LAMBDA IS INCORRECTLY USED:
- DO NOT multiply a player's KR by lambda to create a "translated" KR at another level
- DO NOT report separate KR numbers for different levels (e.g., "85 MM / 81 HM")
- The KR is computed once, at the player's home level, using lambda-normalized inputs. That number is final and universal.



# COLLEGE PLAYER KR LEGENDS

COLLEGE PLAYER KR LEGENDS — v3 (MODULAR)

Governance Note: College legends have been moved to individual files per level for modularity and independent calibration. Each file is a standalone legend for one competitive level.

Legend files (14 total, stored as separate project knowledge files):
- Legend_NCAA_D1_HM_v3.md (λ = 1.000) — Calibrated: 48 players / 6 teams
- Legend_NCAA_D1_MM_v3.md (λ = 0.958) — Calibrated: 32 players / 4 teams
- Legend_NCAA_D1_LM_v3.md (λ = 0.917) — Calibrated: 32 players / 4 teams
- Legend_NCAA_D2_v3.md (λ = 0.875) — Calibrated: 16 players / 2 teams
- Legend_NCAA_D3_v3.md (λ = 0.667) — Tier breaks set, no calibration data yet
- Legend_NAIA_v3.md (λ = 0.810) — Calibrated: 16 players / 2 teams
- Legend_NJCAA_D1_v3.md (λ = 0.833) — Tier breaks set, no calibration data yet
- Legend_NJCAA_D2_v3.md (λ = 0.750) — Tier breaks set, no calibration data yet
- Legend_NJCAA_D3_v3.md (λ = 0.625) — Tier breaks set, no calibration data yet
- Legend_CCCAA_v3.md (λ = 0.765) — Tier breaks set, no calibration data yet
- Legend_USCAA_v3.md (λ = 0.583) — Calibrated: 8 players / 1 team
- Legend_NCCAA_D1_v3.md (λ = 0.542) — Tier breaks set, no calibration data yet
- Legend_NCCAA_D2_v3.md (λ = 0.500) — Tier breaks set, no calibration data yet

v3 changes from v2 (applied to ALL levels):
1. All draft/pro projection language removed. College KR is present-tense only.
2. BPR ranges removed from all tiers. Metrics are the pipeline's job, not the legend's.
3. 86-88 tier renamed from "Glue Guy" to "High-Minute Role Player" — covers facilitators.
4. 92-94 tier rewritten to accommodate spike AND complete profiles.
5. Calibration examples from 152-player study added where data exists.

To read a player's legend: use the player's home level key to select the correct legend file, then find the tier matching their KR.

For Level Tier Map (cross-level reads): read the same KR against multiple legend files to show what the number means at each level. One KR, multiple legend reads.


# PRO PLAYER KR LEGEND

Pro Player KR Legend

KaNeXT — Pro Player KR Legend
Global Professional Basketball
Player-Level Output Interpretation
Scope:
This legend provides a universal KaNeXT Rating (KR) for professional basketball players
worldwide on a 0–100 scale, aligned with college player and team legends.
What KR Represents:
KR reflects a player’s global basketball value, role viability, and portability across
professional environments — not league prestige, fame, or market size.
Context assumptions:
● Global pro ecosystem (NBA, EuroLeague, CBA, NBL, B.League, domestic leagues
worldwide)
● Modern efficiency metrics adjusted for league strength and SOS (e.g., PER/BPM-style
signals)
● Archetype-based evaluation (not strict roster-slot mapping)
● Broader bands to reflect global variance and churn
● Economic signals reflect market demand, not KR causality
Economic reference ranges reflect 2025–2026 realities.

PRO PLAYER KR TIERS (DISPLAY / READ-ONLY)
98–100 — Global Apex / Transcendent Superstar
Competitive Role Reality:
● League-defining icon who warps systems and wins titles
● One of the absolute best players in the world, anywhere
League Reality:
● Primarily NBA elites; extremely rare global standouts who could dominate any league
League Anchors (examples):
● NBA: Perennial MVP / All-NBA dominators
● Global: National team legends for top FIBA nations
Economic Reality:
● ~$45M–$65M+ (NBA max-level; endorsements can exceed)
94–97 — Elite Franchise Anchor
Competitive Role Reality:
● Primary star who carries teams in elite competition
● Decisive impact in high-stakes games worldwide
League Reality:
● NBA All-Stars; top-tier overseas MVPs with NBA mobility
League Anchors (examples):
● NBA: Consistent All-Stars / top-20 caliber players
● EuroLeague / CBA: Dominant imports or domestic franchise stars
Economic Reality:
● ~$20M–$50M (NBA)
● ~$2M–$6M (top overseas contexts, often net-adjusted)

90–93 — High-Impact Global Star
Competitive Role Reality:
● Reliable star starter who closes games and elevates teams
● Franchise pillar in most pro environments
League Reality:
● NBA playoff starters or closers
● MVP-caliber players in EuroLeague, NBL, CBA, B.League
League Anchors (examples):
● NBA: Key starters on contenders
● EuroLeague / NBL / CBA: All-League selections or MVPs
Economic Reality:
● ~$10M–$30M (NBA)
● ~$800k–$4M (premier overseas leagues)
86–89 — Core Professional Contributor
Competitive Role Reality:
● Trusted high-minute rotation player with system value
● Starter or high-impact bench piece in strong leagues
League Reality:
● NBA rotation players
● Strong starters in EuroCup, ACB, Turkey, Germany, Italy
League Anchors (examples):
● NBA: Solid playoff-rotation contributors
● EuroCup / ACB / BBL / Turkey: Reliable starters or closers
Economic Reality:
● ~$3M–$10M (NBA)
● ~$300k–$1.5M (upper domestic tiers)

82–85 — Stable Professional Role Player
Competitive Role Reality:
● Dependable pro with recurring contracts
● Starter in mid-level leagues or rotation in elite ones
League Reality:
● NBA fringe / G League standouts
● Core starters in BCL, B.League, NBL, strong domestic leagues
League Anchors (examples):
● G League: High contributors
● BCL / B.League / NBL: Core starters
Economic Reality:
● ~$100k–$500k globally
● G League base ~$45k+
78–81 — Rotation-Level Professional
Competitive Role Reality:
● Established player who fits rotations reliably
● Starter or bench contributor in lower pro circuits
League Reality:
● Lower Euro/domestic leagues
● G League rotation players
League Anchors (examples):
● France LNB / Adriatic / Israel: Starters
● Domestic leagues worldwide: Key rotation
Economic Reality:
● ~$50k–$300k

73–77 — Fringe Professional
Competitive Role Reality:
● Edge-of-roster pro with variable job security
● Starter in weaker leagues or depth in stronger ones
League Reality:
● Lower global domestics
● Injury-fill or churn roles
League Anchors (examples):
● Southeast Asia / South America: Starters
● Minor globals: Rotation or short-term contracts
Economic Reality:
● ~$20k–$100k
68–72 — Entry-Level / Replacement Professional
Competitive Role Reality:
● Can land pro deals, but high churn and risk
● Replacement-level roles across most setups
League Reality:
● Bottom-tier global leagues
● Semi-pro overlap zones
League Anchors (examples):
● Low domestic tiers: Temporary starters or replacements
Economic Reality:
● Expenses covered to ~$50k
Note: KR 68–77 represents the global professional churn band.

60–67 — Semi-Professional / Local Level
Competitive Role Reality:
● Below full pro viability
● Competitive in semi-pro or local domestic minors
League Anchors (examples):
● Semi-pro leagues worldwide
● High-amateur / lower domestic divisions
Economic Reality:
● Stipends / expenses up to ~$20k
Paid ≠ professional viability.
Below 60 — Non-Professional
Competitive Role Reality:
● Not sustainable at professional levels
Used For:
● College or amateur players without pro pathways
● Global talent pyramid modeling
Economic Reality:
● N/A (amateur / non-competitive)
UI / GOVERNANCE NOTE (keep this line)
Display legend only. Pro Player KR values are produced by Nexus. No
evaluation, weighting, or normalization logic lives here.

BPR -- Basketball Performance Rating

KaNeXT — BPR (Basketball Performance Rating)
Single-Game Player Impact Metric
Interpretation & Governance Document (Internal)
Status: Internal / Confidential
Audience: Founder, Nexus intelligence layer, future system auditors
Not for: UI, builders, coaches, recruiting staff, or external distribution
1. Purpose of BPR
BPR (Basketball Performance Rating) exists to measure actual on-court impact in a single game,
relative to competition level.
It answers one question only:
When this player was on the floor in this game, how much better or worse
was the team because of them, relative to the expected average at that
level?
BPR is a game-only impact anchor, not an evaluation verdict, not a projection, and not a
recruiting ranking.
BPR is the canonical metric name for single-game player impact. There is no alias or surface name. BPR is BPR.
2. Core Principles
2.1 Zero-Centered Meaning

● BPR = 0 → average impact for the player’s competitive level
● BPR > 0 → positive impact
● BPR < 0 → negative impact
BPR is level-relative, not universal.
A +4 at D1 High Major ≠ a +4 at NAIA.
2.2 Determinism
Given the same:
● player
● role
● minutes
● opponents
● outcomes
BPR must produce the same result every time.
No coach preference, system choice, or sandbox setting alters BPR.
3. What BPR Is (and Is Not)
BPR IS
● a single-game player impact signal
● outcome-aware

● opponent-aware
● role-aware
● possession-aware
● offense + defense combined
BPR IS NOT
● a box score stat
● a skill rating
● a projection
● a recruiting ranking
● a talent ceiling estimate
● a stylistic judgment
BPR reflects what happened, not what could happen.
4. Mental Model (Canonical)
BPR ≈ Box Plus-Minus, adjusted for:
● competition strength
● role expectation
● efficiency vs. volume
● lineup context

● repeatability across games
If traditional BPM asks:
“What did you do statistically?”
BPR asks:
“What happened when you played, given the environment?”
5. Internal Interpretation Bands (Non-UI)
These bands are internal anchors only.
They are used to sanity-check KR alignment and postgame narratives.
● +10 and above → Game-warping impact. Outcomes consistently swing with presence.
● +6 to +9 → Clear winning driver. Strong positive across matchups and lineups.
● +3 to +5 → Reliable positive contributor. Helps teams win more than lose.
● –2 to +2 → Neutral to slightly positive. Performing at expected level.
● –3 to –5 → Negative impact. Liability unless role-constrained.
● –6 to –9 → Strong negative impact. Consistently degrades lineup effectiveness.
● –10 and below → Severe negative impact. Game-shifting harm.
(These labels are for internal interpretation only; not UI copy.)
6. Relationship Between BPR and KR

KR = Player Identity
BPR = Single-Game On-Court Reality
They are related but not redundant.
Scenario Interpretation
High KR + High BPR True high-level player; impact translating
High KR + Low BPR Skill present; impact not translating
Low KR + High BPR Role player outperforming profile
Low KR + Low BPR Replacement-level or developmental
BPR checks KR.
KR does not derive from BPR.
7. Relationship Between BPR and TPQ
TPQ (Team Performance Quality) is team-level, single-game performance.
BPR (Basketball Performance Rating) explains who drove the TPQ outcome.
BPR rolls up into postgame summaries, but:
● BPR does not dictate TPQ directly (team context matters)
● TPQ does not overwrite BPR (individual impact is preserved)

8. Governance Rules
● BPR is never edited manually
● BPR is never coach-adjustable
● BPR is never sandbox-editable
● BPR is never recomputed “on open” as a UI side-effect
● Any change to:
○ methodology
○ inputs
○ scaling
○ normalization
requires documentation, versioning, and explicit approval
Outputs must store:
● bpr_value
● bpr_version
● inputs_snapshot_hash (or equivalent audit reference)

9. Why BPR Is Referenced but Not
Exposed Raw
BPR exists to:
● keep KR honest
● prevent stat padding
● anchor evaluation to outcomes
It is intentionally not a default user-facing metric to avoid:
● misinterpretation
● misuse
● metric chasing
The system’s job is truth, not comfort.
10. Canonical Summary (Lock)
BPR measures single-game impact, not identity.
Zero is average for level.
Positive helps you win.
Negative hurts you win.
KR tells the story; BPR keeps it honest.

