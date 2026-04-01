# NEXUS WOMEN'S FLAG FOOTBALL INTELLIGENCE - FILE 02: PLAYER EVAL REFERENCE
## v1.0

---

# UI SYSTEM SET

UI SYSTEM SET - v1 (LOCKED)

Purpose: The UI System Set defines the valid offensive and defensive system selections available to coaches during Coach Context Setup.

Offensive Systems (6)
1. Spread
2. Trips
3. Bunch
4. Motion-Heavy
5. QB Run-First
6. West Coast

Defensive Systems (5)
1. Man Coverage
2. Zone Coverage
3. Rush + Cover
4. Double Rush
5. Spy

Governance: System names must exactly match across all downstream docs. No aliases permitted. Any addition or removal requires documentation, versioning, and approval.

---

# TRAIT LIBRARY

Trait Library

KaNeXT Women's Flag Football Trait Clusters - Canonical 5 (name set)
1. Athletic (speed, agility, quickness, explosiveness, endurance)
2. Skill (route running, catching, evasion, flag pulling, ball handling)
3. Quarterback (passing accuracy, arm talent, scrambling, decision-making)
4. Defensive (coverage, flag pulling, rush technique, reading QB, zone drops)
5. IQ (play design, pre-snap reads, clock management, situational awareness)

---

## ATHLETIC CLUSTER - Locked Traits (8)

1) Straight-Line Speed
Definition: Top-end speed in a straight line. The most basic and most important athletic trait in flag football.
Inputs: 40-yard dash, 100m dash time, game speed (film), track results from other sports
Bands (v0 - women's):
- 90: 4.65s or faster 40 (elite D1 track-level speed)
- 80: 4.75-4.85s 40
- 70: 4.86-5.00s 40
- 60: 5.01-5.15s 40
- <60: Slower than 5.15s
Box-score mode: UNSCORED (null) unless track times available from other sports. PROXY from game film if available (breakaway TD frequency, pursuit angles from defenders).

2) Agility / Change of Direction
Definition: Ability to change direction at speed without losing velocity. THE most game-impactful athletic trait in flag football alongside speed.
Inputs: 5-10-5 shuttle, 3-cone drill, L-drill, game film (juke frequency, flag evasion rate)
Bands (v0 - women's):
- 90: Sub-4.30 shuttle / sub-7.0 3-cone
- 80: 4.30-4.45 shuttle / 7.0-7.25 3-cone
- 70: 4.46-4.60 shuttle / 7.26-7.50 3-cone
- 60: 4.61-4.80 shuttle / 7.51-7.80 3-cone
- <60: Above 4.80 shuttle
Box-score mode: PROXY - Inputs: evasion success rate (YAC, broken tackles equivalent in flag = missed flag pulls against), rushing YPC on designed runs

3) Acceleration / Burst
Definition: Speed from a standstill to full speed. Critical for route running (out of breaks) and defensive recovery.
Inputs: 10-yard split, first-step quickness on film, route break speed
Bands (v0):
- 90: Elite first step, consistently creates separation out of breaks
- 80: Quick first step, reliable separation
- 70: Average acceleration, creates separation on some routes
- 60: Below-average burst, relies on scheme to create space
- <60: Slow out of breaks, cannot create separation
Box-score mode: UNSCORED (null) - requires film evaluation

4) Lateral Quickness
Definition: Ability to move side to side. Critical for defensive mirror ability and offensive juke moves.
Inputs: Shuttle time, film evaluation of lateral plant-and-cut, mirror drills
Bands (v0):
- 90: Elite lateral movement, can mirror any receiver or evade any defender 1-on-1
- 80: Quick laterally, reliable mirror/evasion
- 70: Average lateral movement
- 60: Below-average, gets beat on sharp cuts
- <60: Stiff laterally
Box-score mode: UNSCORED (null)

5) Vertical Explosiveness
Definition: Jumping ability. Less critical in flag football than tackle (no contested catches at NFL height), but matters for high-point catches and deflections.
Inputs: Vertical jump, broad jump, film (high-point catches, jump-ball wins)
Bands (v0 - women's):
- 90: 24"+ vertical
- 80: 21-23" vertical
- 70: 18-20" vertical
- 60: 15-17" vertical
- <60: Below 15"
Box-score mode: UNSCORED (null)

6) Endurance / Motor
Definition: Ability to maintain speed and effort across a full game. Critical for two-way players who play every snap on both sides.
Inputs: Game film showing second-half speed maintenance, two-way snap count without decline
Bands (v0):
- 90: Zero production decline in second halves. Full speed on every snap. Two-way warrior.
- 80: Minimal decline. Maintains effort on both sides.
- 70: Some decline in second halves or late-season fatigue.
- 60: Noticeable drop-off when fatigued.
- <60: Significant decline in production/effort when tired.
Box-score mode: PROXY - Compare first-half vs second-half production splits

7) Body Control
Definition: Ability to control body in space - balance, coordination, body lean, toe-tap sideline ability.
Inputs: Film evaluation of sideline catches, balance through contact (screen blocking contact), in-air body control
Bands (v0):
- 90: Elite body control. Routinely makes contested sideline catches. Perfect balance.
- 80: Strong body control. Reliable sideline awareness.
- 70: Average body control.
- 60: Occasional balance issues. Struggles with body positioning.
- <60: Poor balance and coordination.
Box-score mode: UNSCORED (null)

8) Functional Strength
Definition: Not raw strength (irrelevant in no-contact flag football), but functional strength for flag evasion, stiff-arm equivalent moves, and maintaining speed through screen contact.
Inputs: Film evaluation, contact balance, ability to maintain route integrity through incidental contact
Bands (v0):
- 90: Powerful through incidental contact. Maintains route/run integrity.
- 80: Good functional strength. Rarely knocked off route.
- 70: Average. Sometimes affected by physical play.
- 60: Gets pushed off routes/runs by physical defenders.
- <60: Weak through any contact.
Box-score mode: UNSCORED (null)

---

## SKILL CLUSTER - Locked Traits (9)

1) Route Running - Precision
Definition: Ability to run crisp, sharp routes at full speed. The cornerstone offensive skill in flag football.
Inputs: Film evaluation of route breaks, separation at the catch point, route tree depth
Bands (v0):
- 90: Elite. Crisp breaks on all route types. Consistently open against man coverage.
- 80: Sharp routes. Reliable separation on 80%+ of routes.
- 70: Solid route runner. Can run the basic tree effectively.
- 60: Limited route tree. Rounded breaks.
- <60: Raw route runner. Relies on athleticism, not technique.
Box-score mode: PROXY - Inputs: catch rate, YPR, separation (if available)

2) Route Running - Breadth
Definition: How many routes in the route tree the player can execute effectively.
Inputs: Film evaluation of route variety, game tape showing 5+ route types
Bands (v0):
- 90: Full route tree (10+ routes). Can run any route from any position.
- 80: Deep route tree (7-9 routes). Effective from multiple alignments.
- 70: Intermediate tree (5-6 routes). Reliable on core routes.
- 60: Limited tree (3-4 routes). Predictable.
- <60: 1-2 routes only. Extremely predictable.
Box-score mode: UNSCORED (null) - requires film

3) Hands / Catching Ability
Definition: Ability to catch the football cleanly and consistently.
Inputs: Catch rate, drop rate, contested catch rate (if available), film evaluation
Bands (v0):
- 90: Elite hands. Sub-3% drop rate. Catches everything thrown near her.
- 80: Very good hands. 3-5% drop rate. Reliable on contested catches.
- 70: Solid hands. 5-8% drop rate. Occasional drop.
- 60: Inconsistent hands. 8-12% drop rate.
- <60: Unreliable. 12%+ drop rate.
Box-score mode: DIRECT - Inputs: catch rate, drop rate

4) Yards After Catch / Evasion
Definition: Ability to create yards after the catch through evasion, acceleration, and open-field running. THE most valuable post-catch skill in flag football because defenders must pull flags, not tackle.
Inputs: YAC per reception, missed flag pulls forced, film evaluation of evasion moves
Bands (v0):
- 90: Elite YAC creator. Forces 2+ missed flag pulls per game. Turns short catches into long gains.
- 80: Dangerous with ball in hands. 1-2 missed pulls per game.
- 70: Can create some YAC. Occasional evasion.
- 60: Limited YAC ability. Caught near the spot of the catch.
- <60: No evasion. Flagged immediately upon reception.
Box-score mode: PROXY - Inputs: YAC per reception (if tracked), YPR relative to average air yards

5) Ball Handling / Ball Security
Definition: Ability to secure the football on receptions, handoffs, and runs. Fumbles in flag football are rare but devastating.
Inputs: Fumble rate, film evaluation of ball security through traffic
Bands (v0):
- 90: Zero fumbles. Perfect ball security in all situations.
- 80: Near-zero fumbles. Occasional loose ball that's recovered.
- 70: Rare fumble (1 per season).
- 60: Occasional ball security issues (2-3 per season).
- <60: Chronic ball security problem.
Box-score mode: DIRECT - Inputs: fumble rate

6) Flag Pull Technique (Defensive)
Definition: Ability to successfully pull an opponent's flag. THE most important defensive skill in flag football. Replaces tackling.
Inputs: Flag pull %, flag pull attempts, film evaluation of technique (hip tracking, hand placement, timing)
Bands (v0):
- 90: 92%+ flag pull rate. Perfect technique. Never misses in the open field.
- 80: 85-91% flag pull rate. Very reliable. Occasional miss on elite evaders.
- 70: 78-84% flag pull rate. Solid. Some misses against quick players.
- 60: 70-77% flag pull rate. Inconsistent. Misses in critical moments.
- <60: Below 70% flag pull rate. Liability.
Box-score mode: DIRECT - Inputs: flag pull rate if tracked

7) Evasion Moves (Offensive)
Definition: Repertoire and effectiveness of evasion moves - juke, spin, stutter-step, hesitation, speed cut, jump cut.
Inputs: Film evaluation of move variety and effectiveness, missed flag pulls forced
Bands (v0):
- 90: 3+ effective evasion moves. Can beat any defender 1-on-1 in space. Forces multiple missed flag pulls per game.
- 80: 2-3 effective moves. Reliable 1-on-1 in space.
- 70: 1-2 effective moves. Can create some evasion.
- 60: Limited moves. Relies on speed, not technique.
- <60: No evasion repertoire. Predictable when defended.
Box-score mode: PROXY - Inputs: missed flag pulls forced (if tracked), rushing YPC on designed runs

8) Screen Blocking Awareness
Definition: In flag football, "blocking" is limited to screen blocking (no contact initiation, remain within frame of body). This trait measures the player's ability to legally position their body to create running lanes.
Inputs: Film evaluation of screen blocking technique and effectiveness
Bands (v0):
- 90: Elite screen blocker. Creates lanes consistently within the rules. Never draws penalties.
- 80: Effective screen blocker. Good body positioning.
- 70: Average. Sometimes effective, sometimes flagged for illegal contact.
- 60: Below average. Struggles with legal positioning.
- <60: Liability. Draws frequent penalties.
Box-score mode: UNSCORED (null) - requires film

9) Snap Execution (Center only)
Definition: Ability to deliver a clean, consistent snap to the QB. A bad snap in flag football is a lost play because there's no offensive line to protect during a fumble recovery.
Inputs: Bad snap rate, snap velocity, snap accuracy under pressure
Bands (v0):
- 90: Zero bad snaps. Perfect delivery every time.
- 80: 1-2 bad snaps per season. Reliable under pressure.
- 70: 3-5 bad snaps per season. Occasional issue.
- 60: 6-10 bad snaps per season. Inconsistent.
- <60: 10+ bad snaps. Liability.
Box-score mode: PROXY - if bad snap count tracked

---

## QUARTERBACK CLUSTER - Locked Traits (8)

1) Accuracy - Short (0-10 yards)
Definition: Completion accuracy on short throws. The bread-and-butter of flag football passing.
Inputs: Short-range completion %, overall completion %, YPA context
Bands (v0):
- 90: 78%+ short completion
- 80: 72-77%
- 70: 65-71%
- 60: 58-64%
- <60: Below 58%
Box-score mode: PROXY - Inputs: overall completion %, YPA

2) Accuracy - Intermediate (10-20 yards)
Definition: Accuracy on intermediate throws.
Bands (v0):
- 90: 68%+ intermediate completion
- 80: 60-67%
- 70: 52-59%
- 60: 44-51%
- <60: Below 44%
Box-score mode: PROXY - Inputs: overall comp%, YPA

3) Accuracy - Deep (20+ yards)
Definition: Accuracy on deep throws.
Bands (v0):
- 90: 50%+ deep completion
- 80: 42-49%
- 70: 34-41%
- 60: 26-33%
- <60: Below 26%
Box-score mode: PROXY - Inputs: YPA, TD rate on long completions

4) Arm Talent
Definition: Raw arm strength, throw velocity, and ability to make throws from multiple platforms/angles. Less critical in flag football than tackle (field is open, no tight windows between linemen) but still matters for deep ball and throw-on-the-run.
Bands (v0):
- 90: Elite velocity + accurate from multiple platforms + throw-on-run comp 70%+
- 80: Above-average velocity + functional off-platform
- 70: Average velocity + occasional off-platform
- 60: Below-average arm + limited platform variety
- <60: Weak arm, single-platform only
Box-score mode: UNSCORED (null) - requires film

5) Scramble Ability
Definition: Ability to extend plays and create with legs when the rush arrives. In flag football, there is no blocking - the rush comes clean every time. Scramble ability is CRITICAL.
Bands (v0):
- 90: Elite scrambler. Turns broken plays into big gains. Defenders can't get flags. Dangerous runner.
- 80: Very good scrambler. Extends plays regularly. Rushing threat.
- 70: Capable scrambler. Can escape pressure. Some rushing production.
- 60: Limited scramble. Gets flagged quickly when leaving the pocket area.
- <60: No scramble ability. Sitting duck when rushed.
Box-score mode: PROXY - Inputs: rushing yards, rushing TDs, sacks taken (low = good evasion)

6) Decision-Making Under Pressure
Definition: Ability to make correct reads and throws when the rush is arriving. No protection means the rush arrives fast on EVERY play.
Bands (v0):
- 90: Calm under every rush. Makes correct read pre-snap and adjusts post-snap. Never forces throws.
- 80: Strong decision-maker. Occasional bad decision under heavy rush.
- 70: Average. Makes some pressured mistakes.
- 60: Struggles under rush. Forces throws, takes bad sacks.
- <60: Panics under pressure. High INT rate when rushed.
Box-score mode: PROXY - Inputs: TD:INT ratio, INT rate, sacks taken

7) Release Speed
Definition: How quickly the ball comes out. In flag football, the QB often has 2-3 seconds before the rusher arrives. Quick release is survival.
Bands (v0):
- 90: Sub-2 second average release. Ball out before rush arrives.
- 80: 2.0-2.3 second release. Usually beats the rush.
- 70: 2.4-2.7 second release. Sometimes caught by rush.
- 60: 2.8-3.0 second release. Frequently pressured.
- <60: Above 3 second release. Holds the ball too long.
Box-score mode: UNSCORED (null) - requires film

8) Play Calling / Audible
Definition: Many flag football QBs call plays at the line or audible based on defensive alignment. This trait measures strategic command.
Bands (v0):
- 90: Elite play caller. Reads defense pre-snap, audibles into correct play, puts team in best position every snap.
- 80: Strong play caller. Makes good adjustments most of the time.
- 70: Average. Runs the called play effectively but limited audible ability.
- 60: Follows the script. Rarely adjusts.
- <60: Poor recognition. Runs into bad looks.
Box-score mode: UNSCORED (null) - requires film or coach intel

---

## DEFENSIVE CLUSTER - Locked Traits (8)

1) Man Coverage Ability
Definition: Ability to stay with an assigned receiver in man-to-man coverage. Speed and hip fluidity are primary inputs.
Bands (v0):
- 90: Shutdown. Can cover the opponent's best receiver 1-on-1 all game. Zero separation.
- 80: Very good. Tight coverage on most routes. Occasional beat on double moves.
- 70: Solid man cover. Can handle average receivers. Struggles vs elite speed.
- 60: Below average. Gets beat on sharp breaks and speed routes.
- <60: Liability in man. Cannot stay with competent receivers.
Box-score mode: PROXY - Inputs: completion % allowed (if tracked), PBU rate, INTs

2) Zone Coverage Ability
Definition: Ability to read the QB's eyes and break on the ball in zone coverage. Pattern recognition and anticipation.
Bands (v0):
- 90: Elite zone defender. Reads QB eyes, breaks on ball before it arrives. Creates turnovers.
- 80: Strong zone player. Good pattern recognition. Reliable break on ball.
- 70: Average zone. Reads are a half-step slow.
- 60: Struggles in zone. Late breaks. Window is always open.
- <60: Liability in zone. Lost.
Box-score mode: PROXY - Inputs: INTs, PBU, defensive TD rate

3) Flag Pull Technique
Same as Skill Cluster trait #6. Scored once, referenced in both clusters.

4) Rush Timing / Technique
Definition: For designated rushers - ability to time the snap count, get off the 7-yard mark quickly, and arrive at the QB with flag-pulling position.
Bands (v0):
- 90: Elite rusher. Arrives at QB consistently. High sack rate. Perfect timing.
- 80: Very good rush. Gets to QB often. Forces quick throws.
- 70: Average rush. Sometimes gets there. QB can usually escape.
- 60: Inconsistent rush. Easy to evade.
- <60: Non-factor as a rusher.
Box-score mode: PROXY - Inputs: sack rate, rush frequency

5) Ball Skills / Ball Hawk
Definition: Ability to intercept or deflect passes. Making plays on the ball in the air.
Bands (v0):
- 90: Ball hawk. 8+ INTs per season at NAIA level. Catches everything near her.
- 80: Good ball skills. 5-7 INTs per season.
- 70: Average. 3-4 INTs per season.
- 60: Limited ball skills. 1-2 INTs.
- <60: Rarely makes plays on the ball.
Box-score mode: DIRECT - Inputs: INTs per game, INTs per season

6) QB Read Ability
Definition: Ability to read the QB's eyes, shoulders, and release point to anticipate throws.
Bands (v0):
- 90: Reads the QB like a book. Anticipates throws before release.
- 80: Good read ability. Breaks on ball quickly.
- 70: Average. Sometimes jumps routes, sometimes late.
- 60: Late reader. Reacts to the throw, not the QB.
- <60: Cannot read the QB. Always in react mode.
Box-score mode: UNSCORED (null) - requires film

7) Pursuit Speed
Definition: Ability to close on the ball carrier in the open field. Critical because missed flag pulls require recovery speed.
Bands match Athletic Cluster "Straight-Line Speed" - scored once, referenced in both contexts.

8) Defensive Versatility
Definition: Ability to play multiple defensive roles - rush, man coverage, zone, spy.
Bands (v0):
- 90: Can play any defensive role effectively. Switches mid-drive without decline.
- 80: Strong in 3+ defensive roles.
- 70: Effective in 2 roles. Limited in others.
- 60: One-dimensional. Only effective in one role.
- <60: Limited to a single role and struggles even there.
Box-score mode: PROXY - Inputs: variety of stat production (INTs + sacks + PBU = versatile)

---

## IQ CLUSTER - Locked Traits (6)

1) Pre-Snap Recognition
Definition: Ability to read the defense (offense) or offense (defense) before the snap and adjust accordingly.
Bands (v0):
- 90: Reads the entire formation instantly. Identifies coverage, rush, and weaknesses pre-snap.
- 80: Strong pre-snap reads. Makes good adjustments.
- 70: Average. Recognizes basic formations and alignments.
- 60: Limited pre-snap reading. Runs the called play regardless.
- <60: No pre-snap recognition.
Box-score mode: UNSCORED (null)

2) Situational Awareness
Definition: Understanding of game situation - down, distance, time, score, field position - and making decisions accordingly.
Bands (v0):
- 90: Perfect situational awareness. Never makes a situational mistake.
- 80: Very good. Rare situational errors.
- 70: Average. Occasional lapses.
- 60: Inconsistent. Makes 1-2 situational errors per game.
- <60: Poor. Frequently makes situation-blind decisions.
Box-score mode: PROXY - Inputs: turnover rate in critical situations, 4th-down conversion rate

3) Clock Management
Definition: Understanding of clock rules and ability to manage pace. Flag football clocks are different from tackle football.
Bands (v0):
- 90: Perfect clock management. Maximizes possessions. Never wastes time.
- 80: Very good. Rare clock errors.
- 70: Average.
- 60: Occasional clock management mistakes.
- <60: Chronic clock management problems.
Box-score mode: UNSCORED (null)

4) Play Design Understanding
Definition: Understanding of the offensive/defensive system's intent, not just assignment execution.
Bands (v0):
- 90: Understands why every play works, not just what to do. Can exploit defensive tendencies.
- 80: Strong schematic understanding. Freelances effectively.
- 70: Good assignment execution. Limited understanding beyond their role.
- 60: Runs their assignment but doesn't understand the bigger picture.
- <60: Confused by scheme complexity.
Box-score mode: UNSCORED (null)

5) Two-Way Transition Speed
Definition: How quickly the player can shift from offensive to defensive mindset (and vice versa) between possessions. Critical in flag football where many players play both ways.
Bands (v0):
- 90: Seamless transition. No mental drop-off between sides.
- 80: Quick transition. Rare lapses.
- 70: Average. Occasional slow start on one side after playing the other.
- 60: Struggles with transition. Clearly better on one side.
- <60: Cannot play both ways effectively.
Box-score mode: PROXY - Compare production on primary vs secondary side

6) Leadership / Communication
Definition: On-field communication, huddle command, and ability to elevate teammates.
Bands (v0):
- 90: Vocal leader. Commands the huddle. Makes everyone better.
- 80: Strong communicator. Reliable leadership.
- 70: Average. Leads by example more than voice.
- 60: Quiet. Limited communication.
- <60: Disengaged.
Box-score mode: UNSCORED (null)

---

# ARCHETYPE LIBRARY

## Offensive Archetypes (12)

### QB Archetypes (4)

**Dual-Threat QB (DT-QB)**
Profile: Elite runner AND passer. Creates with both arm and legs. The ideal flag football QB.
Key Traits: Scramble Ability 80+, Accuracy-Short 75+, Speed 75+, Decision-Making 75+
System Fit: A-tier in Spread, QB Run-First, Motion-Heavy. B-tier in West Coast, Trips. C-tier in Bunch (less running room).

**Pocket Passer (PP-QB)**
Profile: Accuracy-first QB who beats you with arm talent and reads, not legs. Less ideal in flag football than tackle because there is no pocket.
Key Traits: Accuracy-Short 85+, Accuracy-Intermediate 80+, Release Speed 80+, Decision-Making 80+
System Fit: A-tier in West Coast, Trips. B-tier in Spread, Bunch. C-tier in QB Run-First, Motion-Heavy.

**Scramble-First QB (SF-QB)**
Profile: Runner who can throw. Dangerous rushing threat. Passing is secondary.
Key Traits: Speed 85+, Scramble Ability 85+, Agility 80+, Accuracy-Short 65+
System Fit: A-tier in QB Run-First. B-tier in Spread, Motion-Heavy. C-tier in West Coast, Bunch, Trips.

**Game Manager QB (GM-QB)**
Profile: Won't lose you the game. Smart, efficient, low-turnover. Limited upside.
Key Traits: Decision-Making 80+, Accuracy-Short 75+, IQKR 80+, Turnover rate bottom-20%
System Fit: A-tier in West Coast. B-tier in Bunch. C-tier everywhere else.

### WR Archetypes (4)

**Speed Burner (SB-WR)**
Profile: Deep threat. Blows the top off coverage with pure straight-line speed.
Key Traits: Speed 85+, Acceleration 80+, Route Running-Precision 70+
System Fit: A-tier in Spread, Trips. B-tier in QB Run-First, Motion-Heavy. C-tier in Bunch, West Coast.

**Possession Receiver (PR-WR)**
Profile: Reliable hands. Wins with route running and consistency, not raw speed.
Key Traits: Hands 85+, Route Running-Precision 85+, Route Running-Breadth 80+, Catch Rate 75%+
System Fit: A-tier in West Coast, Bunch. B-tier in Spread, Trips. C-tier in QB Run-First.

**YAC Monster (YAC-WR)**
Profile: Dangerous after the catch. Short-area quickness and evasion make short throws into long gains.
Key Traits: Evasion Moves 85+, Agility 85+, YAC 80+, Lateral Quickness 80+
System Fit: A-tier in West Coast, Motion-Heavy, Spread. B-tier in Trips, Bunch.

**Complete Receiver (CR-WR)**
Profile: Does everything. Speed, routes, hands, YAC. The total package.
Key Traits: Speed 80+, Route Running-Precision 80+, Hands 80+, YAC 75+
System Fit: A-tier everywhere. The universal WR.

### Utility Archetypes (4)

**Versatile Back (VB-RB)**
Profile: Can run, catch, and create in the open field. Flag football RB is more WR than tackle RB.
Key Traits: Agility 80+, Hands 75+, Speed 75+, Evasion 75+
System Fit: A-tier in Spread, Motion-Heavy. B-tier in Trips, QB Run-First.

**Receiving Center (RC-C)**
Profile: Reliable snap, then dangerous as a receiver on crossing and option routes.
Key Traits: Snap Execution 80+, Hands 75+, Route Running 70+, IQKR 75+
System Fit: A-tier in West Coast, Bunch (center often runs rub routes). B-tier in Spread.

**Snap Specialist Center (SS-C)**
Profile: Perfect snap, limited receiving threat. The safe choice.
Key Traits: Snap Execution 90+, IQKR 70+
System Fit: B-tier everywhere. Never the reason you win, but never the reason you lose.

**Two-Way Athlete (TWA)**
Profile: Elite athlete who plays both offense and defense at high levels. The unicorn.
Key Traits: AKR 85+ (speed/agility elite), Endurance 80+, Versatility 80+
System Fit: A-tier in any system that needs both-sides contribution. Most valuable at roster-limited programs.

## Defensive Archetypes (8)

**Shutdown Corner (SC-CB)**
Profile: Locks down the opponent's best receiver. Man coverage specialist.
Key Traits: Man Coverage 85+, Speed 85+, Lateral Quickness 80+, Flag Pull 80+
System Fit: A-tier in Man Coverage. B-tier in Spy (can be assigned the best WR).

**Ball Hawk (BH-S)**
Profile: Safety who plays centerfield and creates turnovers. Zone coverage specialist.
Key Traits: Zone Coverage 85+, Ball Skills 85+, QB Read 80+, Speed 80+
System Fit: A-tier in Zone Coverage, Rush + Cover (deep safety). B-tier in Spy.

**Blanket Slot Defender (BSD)**
Profile: Specializes in covering the slot receiver. Quick feet, mirror ability, short-area defense.
Key Traits: Lateral Quickness 85+, Man Coverage 80+, Flag Pull 85+, Agility 85+
System Fit: A-tier in Man Coverage. B-tier in Zone (covers underneath zones).

**Pass Rush Specialist (PRS)**
Profile: Elite at getting to the QB from the 7-yard rush mark. Speed and timing.
Key Traits: Speed 85+, Rush Timing 85+, Acceleration 85+, Flag Pull 80+
System Fit: A-tier in Rush + Cover, Double Rush. B-tier in Man Coverage (as designated rusher).

**Hybrid Defender (HD)**
Profile: Can rush, cover, or spy the QB. Defensive coordinator's chess piece.
Key Traits: Defensive Versatility 85+, Speed 80+, Flag Pull 80+, IQKR 80+
System Fit: A-tier in Spy, Zone Coverage. B-tier everywhere else.

**Coverage Linebacker (CLB)**
Profile: Plays the intermediate zones. Reads routes, jumps underneath throws, denies crossing routes.
Key Traits: Zone Coverage 80+, QB Read 80+, Flag Pull 80+, Pursuit Speed 75+
System Fit: A-tier in Zone Coverage. B-tier in Spy (covers intermediate with QB spy).

**Run Stopper / QB Spy (QBS)**
Profile: Dedicated to preventing QB runs. Shadows the QB, mirrors movement, pulls flag on scramble.
Key Traits: Speed 80+, Lateral Quickness 80+, Flag Pull 85+, QB Read 75+
System Fit: A-tier in Spy. B-tier in Man Coverage (as spy assignment). C-tier in Zone (wasted talent).

**Aggressive Disruptor (AD)**
Profile: High risk, high reward. Jumps routes, gambles for INTs, double rushes.
Key Traits: Ball Skills 80+, Speed 85+, Rush Timing 75+, Acceleration 85+
System Fit: A-tier in Double Rush. B-tier in Rush + Cover. C-tier in Man, Zone (too aggressive for disciplined coverage).

---

# SYSTEM DEMAND PROFILES

## Offensive System Demand Profiles

### 1. Spread
- QB: Dual-Threat (A), Complete (A), Pocket Passer (B)
- WR: Speed Burner (A), Complete Receiver (A), YAC Monster (B)
- Center: Receiving Center (A), Snap Specialist (B)
- Needs: 4+ quality receivers, QB who can throw AND run, route diversity
- Identity: Horizontal space creation, 1-on-1 isolations, spread the field

### 2. Trips
- QB: Pocket Passer (A), Dual-Threat (B)
- WR: Complete Receiver (A), Possession Receiver (A), Speed Burner (B - isolated side)
- Center: Receiving Center (B)
- Needs: Route tree depth, timing precision, hot route execution
- Identity: Overload one side, create rub routes and traffic, three-receiver combos

### 3. Bunch
- QB: Pocket Passer (A), Game Manager (A)
- WR: Possession Receiver (A), YAC Monster (A), Complete Receiver (A)
- Center: Receiving Center (A - runs rub routes out of bunch)
- Needs: Spacing, pick plays (legal), YAC, short-area quickness
- Identity: Clustered receivers create confusion at the snap, rub routes for separation

### 4. Motion-Heavy
- QB: Dual-Threat (A), Scramble-First (B)
- WR: YAC Monster (A), Speed Burner (A), Complete Receiver (A)
- Center: Receiving Center (B)
- Needs: Athletes who can align in multiple spots, mental processing of motion assignments
- Identity: Pre-snap motion to create confusion, shift defenders, identify coverage

### 5. QB Run-First
- QB: Scramble-First (A), Dual-Threat (A)
- WR: Speed Burner (B), Complete Receiver (B)
- Center: Receiving Center (B)
- Needs: QB who is the best athlete on the field, receiving threats to keep defense honest
- Identity: QB as the primary weapon, designed runs, scramble-pass combos

### 6. West Coast
- QB: Pocket Passer (A), Game Manager (A), Dual-Threat (B)
- WR: Possession Receiver (A), YAC Monster (A), Complete Receiver (A)
- Center: Receiving Center (A)
- Needs: Short-timing execution, YAC ability across the roster, low-turnover QB
- Identity: Short passes = long runs. Timing, YAC, ball control, wear down coverage with volume

## Defensive System Demand Profiles

### 1. Man Coverage
- CBs: Shutdown Corner (A), Blanket Slot Defender (A)
- Safety: Any (B)
- Rush: Pass Rush Specialist (B)
- Needs: Athletes who can cover 1-on-1 against any receiver, speed matching
- Identity: Best-on-best. Your athletes vs theirs. No help.

### 2. Zone Coverage
- CBs: Coverage Linebacker (A), Ball Hawk (A)
- Safety: Ball Hawk (A)
- Rush: Hybrid (B)
- Needs: IQ, pattern recognition, communication, break on ball
- Identity: Read the QB, protect zones, create turnovers through anticipation

### 3. Rush + Cover
- Rush: Pass Rush Specialist (A)
- CBs: Shutdown Corner (B), Ball Hawk (B)
- Safety: Ball Hawk (B)
- Needs: One elite rusher, five solid coverage players
- Identity: Force quick throws with a designated rusher, cover the rest

### 4. Double Rush
- Rush: Pass Rush Specialist (A), Aggressive Disruptor (A)
- CBs: Shutdown Corner (A) (MUST have elite coverage with fewer defenders)
- Needs: Two rushers who can get to the QB FAST, remaining defenders who can cover 1-on-1 with numerical disadvantage
- Identity: High risk, high reward. Collapse the QB with two rushers, hope coverage holds

### 5. Spy
- Spy: QB Spy (A), Hybrid Defender (A)
- CBs: Shutdown Corner (B), Blanket Slot Defender (B)
- Needs: A defender who can mirror the QB's movement AND pull flag on scramble
- Identity: Take away the QB run. Force her to beat you with her arm only.

---

# BADGES

## Offensive Badges

**Flag Football MVP** - Tier: Gold
Trigger: Conference POY or National POY. Highest-impact player in the conference.

**Touchdown Machine** - Tier: Silver
Trigger: 15+ total TDs in a season (NAIA level). Scales by level.

**Completion Artist** - Tier: Silver
Trigger: QB with 70%+ completion and 3:1+ TD:INT over a full season.

**Deep Threat** - Tier: Bronze
Trigger: 5+ receiving TDs of 30+ yards in a season.

**YAC Queen** - Tier: Silver
Trigger: Top-3 in conference in YAC per reception (if tracked).

**Iron Woman** - Tier: Silver
Trigger: Two-way player with top-25% production on BOTH sides of the ball.

**Perfect Snap** - Tier: Bronze
Trigger: Zero bad snaps in a full season. Center-only.

**Clutch Performer** - Tier: Gold
Trigger: 3+ game-winning drives in a season (4th quarter, team trailing or tied).

**Route Surgeon** - Tier: Silver
Trigger: 80%+ catch rate with 12+ YPR over a full season.

**Dual-Threat Elite** - Tier: Gold
Trigger: QB with 2000+ passing yards AND 500+ rushing yards in a season.

## Defensive Badges

**Shutdown** - Tier: Gold
Trigger: 0 TDs allowed in man coverage assignments over a full season (if trackable).

**Ball Hawk** - Tier: Silver
Trigger: 6+ INTs in a season (NAIA level).

**Flag Strip Artist** - Tier: Silver
Trigger: 92%+ flag pull rate over a full season with 50+ attempts.

**Sack Machine** - Tier: Bronze
Trigger: 10+ sacks (QB flag pulls from rush) in a season.

**Pick Six Queen** - Tier: Gold
Trigger: 3+ defensive TDs (INT returns or fumble returns) in a season.

**Lockdown** - Tier: Silver
Trigger: Sub-40% completion rate allowed in man coverage over a full season.

## Universal Badges

**Multi-Sport Elite** - Tier: Silver
Trigger: All-Conference or equivalent in flag football AND another sport simultaneously.

**Track Speed** - Tier: Bronze
Trigger: Documented sub-12.0 100m dash time (confirms elite straight-line speed).

**Program Builder** - Tier: Silver
Trigger: Captain of a first-year program who leads team to winning record.

---

# OVERRIDES

Override Rules - Flag Football v1

Overrides are mandatory adjustments that fire when specific conditions are met. They supersede normal scoring.

**Speed Override:**
If a player has documented track speed (sub-12.0 100m, sub-4.80 40-yard), AKR floor = 78 regardless of other athletic scores. Speed is THE commodity in flag football.

**Turnover Machine Override:**
If a QB has a TD:INT ratio below 1:1 over a full season (8+ games), IQKR ceiling = 65 regardless of other IQ indicators. Decision-making at QB is disqualifying.

**Flag Pull Liability Override:**
If a defensive player has a flag pull rate below 65% over a full season, DKR ceiling = 60 regardless of other defensive indicators. You cannot play defense if you cannot pull flags.

**Two-Way Elite Override:**
If a player produces top-25% stats on BOTH offense and defense over a full season, AKR floor = 80 and IQKR floor = 75. The two-way workload demands elite athleticism and mental processing.

**Snap Liability Override:**
If a center has 10+ bad snaps in a season, overall KR ceiling = 70 regardless of other production. Bad snaps are catastrophic in no-blocking flag football.

---

# SYSTEM RISKS

System Risks - Flag Football v1

System risks are warnings that fire when a player's profile conflicts with system demands.

**Speed Mismatch Risk:**
Trigger: AKR below 65 in a Spread or Motion-Heavy system.
Explanation: Spread and motion systems require athletes who can win in space. Slow players get exposed.

**Coverage Liability Risk:**
Trigger: DKR below 60 for any two-way player on a roster with fewer than 15 players (high two-way demand).
Explanation: Small rosters force two-way play. If a player can't cover, they're a liability on half the snaps.

**QB Immobility Risk:**
Trigger: QB Scramble Ability below 60 in any flag football system.
Explanation: There is no blocking in flag football. A QB who cannot evade the rush is a sitting duck.

**One-Dimensional Risk:**
Trigger: Player scores 85+ on one component KR but below 60 on all others.
Explanation: Flag football is a multi-skill sport. One-dimensional players get schemed out.

---

# IMPACT MODIFIERS

Impact Modifiers - Flag Football v1

Impact modifiers are context adjustments that do not change KR but affect how KR translates to team value.

**Two-Way Value Modifier:** +5-10% team value for players who can contribute on both sides. In roster-limited flag football, two-way players are gold.

**Olympic Pipeline Modifier:** Players identified as USA Football / Team USA candidates receive a +3% value modifier for programs seeking visibility and pipeline connections.

**Multi-Sport Athlete Modifier:** Players competing in another sport simultaneously may have scheduling conflicts. -3% availability modifier during overlap seasons.

**First-Year Program Modifier:** Players on first-year programs have inflated stats due to weak schedules and disorganized competition. -5% confidence on all production stats.

---

# KLVN - FLAG FOOTBALL LAMBDA NORMALIZATION

## Purpose
KLVN normalizes inputs during trait scoring so that a player's KR reflects actual flag football ability regardless of competitive level.

## How It Works
Lambda normalizes INPUTS (production stats) during trait scoring. It does NOT convert KR OUTPUTS. There is no "NAIA-equivalent KR."

## College Flag Football Lambda Table (v1)

| Rank | Level | Key | lambda_level | Calibration |
|------|-------|-----|---------|-------------|
| 1 | NCAA D1 (when established) | ncaa_d1_flag | 1.000 | Reference (projected) |
| 2 | NAIA Top Programs (Ottawa, Keiser, St. Thomas) | naia_top | 0.920 | Estimate |
| 3 | NAIA Standard | naia_standard | 0.870 | Estimate |
| 4 | NCAA D2 (when established) | ncaa_d2_flag | 0.900 | Estimate (projected) |
| 5 | NCAA D3 (when established) | ncaa_d3_flag | 0.820 | Estimate (projected) |
| 6 | NJCAA | njcaa_flag | 0.780 | Estimate |
| 7 | Club / Intramural (not varsity) | club_flag | 0.600 | Estimate |
| 8 | High School (sanctioned state) | hs_sanctioned | 0.500 | Estimate |
| 9 | High School (non-sanctioned) / Club | hs_club | 0.400 | Estimate |

CRITICAL NOTE: These lambdas are PROVISIONAL. Women's flag football is an emerging sport. NCAA D1 has not yet played a season. The reference lambda (1.000) is assigned to the projected NCAA D1 level based on anticipated talent concentration when P4/P5 schools begin sponsoring. NAIA top programs are currently the highest-quality competition and are estimated at 0.920 relative to projected D1.

As the sport matures and data deepens, these lambdas will be recalibrated. Expect significant adjustments in the first 3-5 years.

## Flag Football-Specific Lambda Notes

1. **Roster size compresses talent.** With only 20-30 player rosters, talent concentration is higher per-player than tackle football's 85+ scholarship rosters. This means the gap between top and bottom programs is WIDER per-player at any given level.

2. **Multi-sport athletes inflate early-program stats.** Many early adopter programs recruit track stars, soccer players, and basketball players. These athletes have elite AKR but may lack flag football-specific skills (route running, flag pulling). Stats may look inflated.

3. **NAIA has the deepest data.** NAIA programs have been playing since 2021. This is the most reliable competition baseline.

4. **NCAA emerging sport data is sparse.** Most NCAA programs launched in 2025-26 or will launch in spring 2026. Limited data exists. Evaluate with caution.

## KR IS UNIVERSAL
One player. One KR. Multiple legend reads. KLVN normalizes INPUTS. It does NOT convert KR OUTPUTS.

---

# COLLEGE PLAYER KR LEGENDS

See separate legend files:
- Legend_NCAA_FlagFB_v1.md (NCAA emerging sport level)
- Legend_NAIA_FlagFB_v1.md (NAIA - deepest data)

---

# PRO PLAYER KR LEGEND

## Pro Flag Football KR Legend (Provisional v1)

Note: Professional women's flag football is in its infancy. The NFL/TMRW Sports pro league has been announced but not yet launched. The WFA FLAG National Tour and SCWPFFL are the current highest-level women's competitions. This legend is HIGHLY PROVISIONAL and based on limited data.

**95-100 - Generational / International Elite.**
Best in the world. Team USA caliber. Olympic-level athlete. Dominant across every phase of the game. Would be the best player in any league, any format.

**90-94 - Pro All-Star / National Team.**
Top-tier professional. Selected for all-star events. National team consideration. Dominant at the pro level with no significant weaknesses.

**85-89 - Pro Starter / Impact Player.**
Clear starter on a quality professional team. Creates matchup problems. Consistent production at the highest level.

**80-84 - Pro Roster / Contributor.**
Makes a professional roster. Contributes in a defined role. Not a star but a reliable piece.

**75-79 - Pro Fringe / Tournament Player.**
Competitive at pro-adjacent events (WFA FLAG nationals, regional pro leagues). Could make a pro roster in a specialist role.

**70-74 - Semi-Pro / Top Amateur.**
Strong amateur player. Competitive at high-level tournaments. Not quite pro caliber.

**Below 70 - Amateur / Recreational.**
Below professional viability.

---

# POSITION TRAIT WEIGHTING (OPF) - DETAILED

See File 01 for the OPF weight table. The table in File 01 is the canonical source.

OPF Computation:
Final Phase 6 Score = sum of (Component KR x OPF Weight) for all applicable components.

For QBs: AKR(20%) + SKR(15%) + QKR(35%) + DKR(5%) + IQKR(25%) = 100%
For non-QBs: QKR weight redistributed proportionally across other four components.

Non-QB Redistribution:
- Outside WR: AKR(30%) + SKR(35%) + DKR(5%) + IQKR(30%) = 100%
- Slot WR: AKR(30%) + SKR(35%) + DKR(5%) + IQKR(30%) = 100%
- RB: AKR(30%) + SKR(25%) + DKR(5%) + IQKR(40%) = 100%
- Center: AKR(15%) + SKR(30%) + DKR(5%) + IQKR(50%) = 100%
- Rusher: AKR(25%) + SKR(10%) + DKR(40%) + IQKR(25%) = 100%
- DB/Safety: AKR(30%) + SKR(15%) + DKR(35%) + IQKR(20%) = 100%

---

# GOVERNANCE

All trait definitions, bands, archetype definitions, system demand profiles, badges, overrides, system risks, impact modifiers, KLVN lambdas, legends, and OPF weights are v1 (PROVISIONAL). Subject to recalibration as data deepens. Any change requires documentation, versioning, and approval.
