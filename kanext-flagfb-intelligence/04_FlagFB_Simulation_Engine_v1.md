# NEXUS WOMEN'S FLAG FOOTBALL INTELLIGENCE - FILE 04: SIMULATION ENGINE
## v1.0

---

# INTERACTION LIBRARY

## 0. Scope
Single authoritative lookup table for all identity-clash interactions consumed by the Simulation Engine.

Three tables:
- Part 1: Scheme x Scheme (6 offense x 5 defense = 30 entries)
- Part 2: Offensive Archetype x Defensive System (12 archetypes x 5 systems = 60 entries)
- Part 3: Defensive Archetype x Offensive System (8 archetypes x 6 systems = 48 entries)

Governance: All archetype/system names must match locked libraries exactly. Deltas bounded by Modifier Framework. Deterministic: same inputs, same deltas.

---

## PART 1: SCHEME x SCHEME INTERACTION (30 entries)

Each entry: Advantage (Offense / Neutral / Defense), Scoring Impact, Turnover Pressure, Key Matchup Drivers.

### SPREAD (Offense) vs...

**vs Man Coverage:** Slight Offense Advantage
- Scoring: +3-5 PPG for offense
- Turnover Pressure: Neutral
- Key: Spread creates 1-on-1 isolations across the field. If any WR wins her matchup, it's a big play. Man must have athletes who can cover 1-on-1.

**vs Zone Coverage:** Neutral
- Scoring: Neutral
- Turnover Pressure: Slight + for defense (zone creates QB read errors vs spread spacing)
- Key: Spread must find the soft spots in zone. If QB reads the zone well, spread wins. If QB stares down receivers, zone creates INTs.

**vs Rush + Cover:** Slight Offense
- Scoring: +2-3 PPG for offense
- Turnover Pressure: Neutral
- Key: Spread has 6 eligible receivers vs 6 in coverage (1 rushing). Numbers advantage in the route game. Rusher must get home fast or spread picks apart the coverage.

**vs Double Rush:** Offense Advantage
- Scoring: +5-8 PPG for offense
- Turnover Pressure: + for both (double rush creates sacks but spread's 6-vs-5 creates mismatches)
- Key: High variance. If double rush gets to QB, defense wins the play. If QB escapes or throws quick, 6-vs-5 is devastating for defense.

**vs Spy:** Slight Offense
- Scoring: +2-3 PPG for offense
- Turnover Pressure: Neutral
- Key: Spy takes away QB run but leaves coverage with one fewer body. Spread exploits the short-handed coverage. If QB can't run anyway, spy is wasted.

### TRIPS (Offense) vs...

**vs Man Coverage:** Offense Advantage
- Scoring: +4-6 PPG
- Key: Trips creates traffic on one side. Man coverage defenders get picked and rubbed in traffic. Natural rub routes from 3 receivers in proximity.

**vs Zone Coverage:** Neutral to Slight Offense
- Scoring: +1-3 PPG
- Key: Trips floods one zone. If zone adjusts, back-side receiver is isolated 1-on-1.

**vs Rush + Cover:** Slight Offense
- Scoring: +2-3 PPG
- Key: Trips overloads one side. Coverage must rotate to trips side, potentially leaving the back side undermanned.

**vs Double Rush:** Offense Advantage
- Scoring: +4-6 PPG
- Key: Double rush + trips = 5 defenders covering 6 receivers with 3 in a cluster creating traffic. Impossible to cover cleanly.

**vs Spy:** Neutral
- Scoring: Neutral
- Key: Trips doesn't rely on QB run. Spy is neither helped nor hurt. Standard coverage battle.

### BUNCH (Offense) vs...

**vs Man Coverage:** Offense Advantage
- Scoring: +5-7 PPG
- Key: Bunch is DESIGNED to beat man coverage. Rub routes, pick plays (legal screens), and traffic at the line make 1-on-1 assignments impossible to execute cleanly. Man coverage's worst nightmare.

**vs Zone Coverage:** Neutral to Slight Defense
- Scoring: -1-2 PPG for offense
- Key: Zone doesn't follow receivers through bunch traffic. Zone drops negate the pick/rub concepts. Bunch must beat zone with timing and precision, not scheme.

**vs Rush + Cover:** Neutral
- Scoring: Neutral
- Key: Bunch is short-area. Rush must arrive before short throws release. If rusher is fast, she can disrupt the timing game. If not, bunch picks apart the coverage.

**vs Double Rush:** Neutral (High Variance)
- Scoring: Volatile
- Key: Bunch's quick throws can beat double rush timing, but double rush can also blow up the play before routes develop. Whoever wins the tempo battle wins.

**vs Spy:** Neutral
- Scoring: Neutral
- Key: Bunch doesn't use QB run. Spy is wasted coverage body. Slight advantage to offense since spy is essentially a free defender for bunch to exploit.

### MOTION-HEAVY (Offense) vs...

**vs Man Coverage:** Offense Advantage
- Scoring: +4-6 PPG
- Key: Motion reveals man coverage instantly (defender follows the motioning receiver). Once identified, offense knows exact coverage and can attack the weak link.

**vs Zone Coverage:** Slight Offense
- Scoring: +2-3 PPG
- Key: Motion reveals zone too (defenders DON'T follow motion). But zone is harder to exploit once identified because defenders are already in position.

**vs Rush + Cover:** Slight Offense
- Scoring: +2-3 PPG
- Key: Motion creates confusion about rush lane responsibilities. Rusher may be blocked (legally screened) by motion traffic.

**vs Double Rush:** Neutral
- Scoring: Neutral
- Key: Motion can disrupt rush lanes but double rush still brings pressure. High variance based on execution.

**vs Spy:** Offense Advantage
- Scoring: +3-5 PPG
- Key: Motion creates so many pre-snap movement patterns that the spy has difficulty tracking the QB. Motion-heavy offenses are often QB-run offenses, and motion creates confusion for the spy assignment.

### QB RUN-FIRST (Offense) vs...

**vs Man Coverage:** Slight Offense
- Scoring: +2-4 PPG
- Key: Man defenders turn their backs to the QB to cover receivers, creating running lanes. QB run-first exploits this with designed runs when defenders are in coverage.

**vs Zone Coverage:** Neutral
- Scoring: Neutral
- Key: Zone defenders face the QB, making designed runs harder. QB must beat zone with arm, which is the weaker part of this archetype.

**vs Rush + Cover:** Neutral to Slight Defense
- Scoring: -1-2 PPG for offense
- Key: Single rusher can track the QB. If rush contains the QB, remaining coverage handles the limited passing game. QB must prove she can throw to win.

**vs Double Rush:** Defense Advantage
- Scoring: -3-5 PPG for offense
- Key: Double rush pressures the QB before designed runs develop. QB run-first needs time to read the defense. Two rushers collapse that window.

**vs Spy:** Defense Advantage
- Scoring: -4-6 PPG for offense
- Key: Spy is BUILT to stop QB run-first. Spy mirrors QB movement. Designed runs are neutralized. QB must beat coverage with passing, which is her weaker skill.

### WEST COAST (Offense) vs...

**vs Man Coverage:** Neutral
- Scoring: Neutral
- Key: West Coast's short timing routes work in man (quick separation) and struggle in man (tight windows). Execution-dependent.

**vs Zone Coverage:** Slight Defense
- Scoring: -1-3 PPG for offense
- Key: Zone sits on the short routes that are West Coast's bread and butter. West Coast must create YAC to beat zone, which requires elite athletes after the catch.

**vs Rush + Cover:** Neutral
- Scoring: Neutral
- Key: West Coast's quick release beats the rush. But if coverage is tight on short routes, completion rate drops. Tempo battle.

**vs Double Rush:** Slight Offense
- Scoring: +2-3 PPG
- Key: West Coast's quick timing game is the best counter to double rush. Ball out before rushers arrive. Short passes against 5 in coverage = favorable odds.

**vs Spy:** Neutral
- Scoring: Neutral
- Key: West Coast doesn't use QB run. Spy is a wasted body. Slight advantage to offense.

---

## PART 2: OFFENSIVE ARCHETYPE x DEFENSIVE SYSTEM (60 entries)

Format: Archetype | System | Advantage | Delta | Key Driver

### Dual-Threat QB (DT-QB)
| DT-QB | Man Coverage | Offense +3 | Creates with arm and legs. Man defenders can't cover and defend QB run. |
| DT-QB | Zone Coverage | Neutral | Zone faces QB, reads her eyes. DT-QB must be accurate to beat zone. |
| DT-QB | Rush + Cover | Slight Offense +2 | Can escape the rusher and create downfield. Rusher must commit. |
| DT-QB | Double Rush | Neutral (high variance) | Elite scrambling escapes double rush, but two rushers can also contain. |
| DT-QB | Spy | Neutral | Spy neutralizes the run element. DT-QB forced to win with arm. |

### Pocket Passer (PP-QB)
| PP-QB | Man Coverage | Slight Offense +1 | Accurate throws in tight windows beat man. |
| PP-QB | Zone Coverage | Offense +3 | Reads zone perfectly. Finds soft spots with precision. |
| PP-QB | Rush + Cover | Neutral | Quick release beats rush, but no scramble escape. |
| PP-QB | Double Rush | Defense +3 | Cannot escape double rush. Gets sacked or forces throws. |
| PP-QB | Spy | Slight Offense +1 | Spy is wasted. PP-QB never runs. Extra coverage body for passing game. |

### Scramble-First QB (SF-QB)
| SF-QB | Man Coverage | Offense +3 | Man defenders in coverage = open running lanes. |
| SF-QB | Zone Coverage | Neutral | Zone faces QB. Running lanes tighter. |
| SF-QB | Rush + Cover | Neutral | Can evade rusher but must throw eventually. |
| SF-QB | Double Rush | Defense +2 | Two rushers contain scramble lanes. |
| SF-QB | Spy | Defense +4 | Spy removes the primary weapon. SF-QB must beat coverage with arm. |

### Game Manager QB (GM-QB)
| GM-QB | Man Coverage | Neutral | Won't lose you the game, won't win it either. |
| GM-QB | Zone Coverage | Slight Offense +1 | Smart reads, low turnovers. Zone can't create INTs. |
| GM-QB | Rush + Cover | Neutral | Quick, safe throws neutralize the rush. |
| GM-QB | Double Rush | Slight Defense +1 | Limited upside means double rush can afford aggression. |
| GM-QB | Spy | Neutral | GM-QB doesn't run. Spy is wasted. |

### Speed Burner WR (SB-WR)
| SB-WR | Man Coverage | Depends on matchup | If CB is slower: Offense +5. If CB matches speed: Neutral. Pure athlete-vs-athlete. |
| SB-WR | Zone Coverage | Slight Offense +2 | Speed threatens deep, pulls zone back, opens intermediate. |
| SB-WR | Rush + Cover | Offense +2 | Speed forces quick coverage decisions. |
| SB-WR | Double Rush | Offense +3 | Short-handed coverage can't handle deep speed. |
| SB-WR | Spy | Slight Offense +1 | Spy doesn't affect WR matchup directly. |

### Possession Receiver (PR-WR)
| PR-WR | Man Coverage | Neutral | Route running creates separation in man. |
| PR-WR | Zone Coverage | Slight Offense +1 | Finds soft spots in zone consistently. |
| PR-WR | Rush + Cover | Neutral | Reliable target for quick throws. |
| PR-WR | Double Rush | Slight Offense +2 | Reliable hands + quick routes = counter to rush pressure. |
| PR-WR | Spy | Neutral | No effect. |

### YAC Monster (YAC-WR)
| YAC-WR | Man Coverage | Offense +3 | Short catch + elite evasion = missed flag pulls = big plays. |
| YAC-WR | Zone Coverage | Offense +2 | Catches in zone soft spots, then creates with agility. |
| YAC-WR | Rush + Cover | Offense +2 | Quick catch from QB under rush + YAC = explosive. |
| YAC-WR | Double Rush | Offense +3 | Quick throws + YAC ability exploit short-handed coverage. |
| YAC-WR | Spy | Neutral | No direct effect. |

### Complete Receiver (CR-WR)
| CR-WR | All systems | Offense +1-2 | No exploitable weakness. Wins in every coverage. Universal advantage. |

### Versatile Back (VB-RB)
| VB-RB | Man Coverage | Slight Offense +1 | Mismatches in coverage if defended by a DB. |
| VB-RB | Zone Coverage | Neutral | Finds zones but not the primary weapon. |
| VB-RB | Rush + Cover | Neutral | Safety valve for QB under rush. |
| VB-RB | Double Rush | Offense +2 | Outlet receiver against pressure. |
| VB-RB | Spy | Neutral | No direct effect. |

### Receiving Center (RC-C)
| RC-C | Man Coverage | Slight Offense +1 | Often uncovered or covered by weakest defender. |
| RC-C | Zone Coverage | Slight Offense +1 | Sneaks into zone gaps as a surprise weapon. |
| RC-C | Rush + Cover | Neutral | Limited impact vs rush. |
| RC-C | Double Rush | Offense +2 | Extra receiving option vs short-handed coverage. |
| RC-C | Spy | Neutral | No effect. |

---

## PART 3: DEFENSIVE ARCHETYPE x OFFENSIVE SYSTEM (48 entries)

### Shutdown Corner (SC-CB)
| SC-CB | Spread | Defense +3 | Removes one WR from the game. Forces other WRs to beat coverage. |
| SC-CB | Trips | Defense +2 | Can follow best WR through traffic. |
| SC-CB | Bunch | Neutral | Bunch traffic neutralizes man coverage. Shutdown gets rubbed. |
| SC-CB | Motion-Heavy | Defense +1 | Follows assignment through motion. Elite discipline. |
| SC-CB | QB Run-First | Neutral | Covering receivers. QB run is someone else's problem. |
| SC-CB | West Coast | Defense +2 | Tight coverage on short routes disrupts West Coast timing. |

### Ball Hawk Safety (BH-S)
| BH-S | Spread | Defense +2 | Reads QB eyes from depth. Creates turnovers on spread's horizontal throws. |
| BH-S | Trips | Defense +1 | Sits over trips side, reads QB. |
| BH-S | Bunch | Defense +2 | Zone coverage over bunch. Reads QB and breaks on ball. |
| BH-S | Motion-Heavy | Neutral | Motion creates confusion for zone reads. |
| BH-S | QB Run-First | Neutral | Ball hawk is a coverage player, not a run defender. |
| BH-S | West Coast | Defense +3 | Zone sitting on short routes creates INTs on West Coast timing throws. |

### Pass Rush Specialist (PRS)
| PRS | Spread | Defense +2 | Forces quick throws from spread's QB. Disrupts timing. |
| PRS | Trips | Defense +1 | Standard rush. |
| PRS | Bunch | Defense +2 | Disrupts bunch's timing game. |
| PRS | Motion-Heavy | Neutral | Motion may disrupt rush lane. |
| PRS | QB Run-First | Defense +3 | Pressure on QB before run develops. Contains scrambles. |
| PRS | West Coast | Defense +1 | West Coast's quick release often beats the rush. |

### Hybrid Defender (HD)
| HD | Spread | Defense +1 | Versatility matches spread's multiple looks. |
| HD | Trips | Defense +1 | Can adjust to trips formations. |
| HD | Bunch | Defense +1 | Can play zone over bunch or rush. |
| HD | Motion-Heavy | Defense +2 | Versatility handles motion adjustments. |
| HD | QB Run-First | Defense +2 | Can spy QB or rush. Dual utility. |
| HD | West Coast | Neutral | Standard coverage. |

### QB Spy (QBS)
| QBS | Spread | Neutral | Spread doesn't rely on QB run. Spy is wasted. |
| QBS | Trips | Neutral | Same. |
| QBS | Bunch | Neutral | Same. |
| QBS | Motion-Heavy | Slight Defense +1 | Motion-heavy often uses QB run. Spy helps. |
| QBS | QB Run-First | Defense +4 | Spy directly counters the primary weapon. |
| QBS | West Coast | Neutral | Wasted. |

### Aggressive Disruptor (AD)
| AD | Spread | High Variance | Gambles create INTs or give up TDs. |
| AD | Trips | High Variance | Same. |
| AD | Bunch | Defense +1 | Aggression in bunch traffic can create turnovers. |
| AD | Motion-Heavy | Defense -1 | Motion exploits aggressive defenders who bite on fakes. |
| AD | QB Run-First | Neutral | Aggressive approach can work against run-first if disciplined. |
| AD | West Coast | Defense +2 | Jumping short routes creates INTs vs West Coast. |

---

# SIMULATION ENGINE

## Drive Resolution Model (Flag Football v1)

### Drive Structure
A flag football drive proceeds from the team's starting field position. In most formats:
- Offense starts at their own 5-yard line (or equivalent after change of possession)
- Must cross midfield for first down (in some formats), then score
- 4 downs to gain first down or score
- No punting. Fourth down is go-for-it or turnover on downs.

### Per-Play Resolution

Each play resolves through this sequence:
1. **Rush Pressure Check:** Does the defense rush? How fast does the rusher arrive?
   - Rush arrival time vs QB release time determines if throw is pressured
   - Pressured throws: -15% completion probability, +10% INT probability
   - Sack (flag pull on QB): Drive setback, loss of down
2. **Coverage Check:** What coverage is the defense in? Man, zone, or hybrid?
   - Man: 1-on-1 matchups. Faster WR = higher completion probability.
   - Zone: QB read quality determines completion probability. Good reads = high comp%, bad reads = INTs.
3. **Throw/Run Decision:** Does the QB throw or run?
   - Based on QB archetype, play call, and defensive look
   - QB run: Scramble speed vs pursuit speed. Flag pull probability based on defender agility vs QB agility.
4. **Completion/Incompletion:** If throw:
   - Base completion probability from QB accuracy band + WR hands band + coverage quality
   - Adjust for pressure (from step 1)
   - Adjust for scheme advantage (from Interaction Library)
5. **YAC Resolution:** If completed:
   - Base YAC from WR YAC trait + defender flag pull trait
   - Missed flag pull probability from defender's flag pull % band
   - If flag pull missed: additional yards until next defender arrives
6. **Flag Pull / Touchdown:** Play ends when:
   - Flag pulled (ball spotted at flag pull point)
   - Touchdown (ball crosses goal line)
   - Incomplete pass
   - Interception
   - Sack (QB flag pulled behind LOS)
   - Ball hits ground (dead ball in flag football on any fumble that hits ground - varies by rulebook)

### Drive Outcome Probabilities

Base drive outcome distribution (NAIA level, average teams, v0):

| Outcome | Probability |
|---|---|
| Touchdown | 38-45% |
| Turnover on Downs | 25-30% |
| Interception | 8-12% |
| Sack/Loss leading to failed 4th down | 10-15% |
| Fumble/Turnover | 2-4% |
| End of Half/Game (time expires) | 5-8% |

Note: Touchdown rates in flag football are MUCH higher than tackle football. No run defense, no tackling, and 4 downs to gain 20 yards (or equivalent) means offenses score frequently. Games commonly end 40-30 or higher at competitive levels.

### Scoring Model

| Scoring Play | Points |
|---|---|
| Touchdown | 6 |
| 1-point conversion (from 3-yard line) | 1 |
| 2-point conversion (from 10-yard line) | 2 |
| Safety (flag pull in own end zone) | 2 |
| Interception return TD | 6 |

Note: No field goals, no PAT kicks. All scoring is through the end zone. Conversion choice is a strategic decision driven by game situation and IQKR.

### Game Simulation

Full game simulation:
1. Determine possessions per half (typically 8-12 possessions per team in a 25-minute half)
2. For each possession, run drive resolution
3. Apply scheme x scheme modifiers from Interaction Library
4. Apply archetype matchup modifiers
5. Apply speed mismatch modifiers (see below)
6. Track cumulative score
7. Apply late-game clock management adjustments (conservative vs aggressive play calling based on score differential and time remaining)
8. Final score and win probability

### Win Probability Model

Win Probability = f(Team KR differential, Scheme advantage, Speed mismatch, Home field, Recent form)

Base formula:
- Team KR differential of +5 = approximately 65% win probability
- Team KR differential of +10 = approximately 78% win probability
- Team KR differential of +15 = approximately 88% win probability
- Home field advantage: +3% (flag football home field is smaller than tackle because there's less crowd noise impact, but familiarity with field/facility matters)

Modifiers:
- Scheme advantage (from Interaction Library Part 1): +/- 3-5%
- Speed mismatch (see below): +/- 2-4%
- Recent form (last 3 games trend): +/- 2-3%

---

# SPEED / AGILITY MISMATCH MODIFIERS

## Purpose
In flag football, speed and agility mismatches are THE most impactful physical differentiators. Unlike tackle football, there is no way to physically neutralize a speed advantage (no blocking, no tackling). A faster player simply wins.

## Speed Mismatch Detection

Compare AKR (Athletic KR) of matched players:

| AKR Differential | Modifier |
|---|---|
| 0-5 AKR gap | No modifier. Competitive matchup. |
| 6-10 AKR gap | +0.5 PPG for the faster side. Slight separation advantage. |
| 11-15 AKR gap | +1.5 PPG for the faster side. Clear speed advantage. Separation on every route. |
| 16-20 AKR gap | +3.0 PPG for the faster side. Dominant mismatch. Coverage is broken play after play. |
| 20+ AKR gap | +5.0 PPG for the faster side. Unplayable mismatch. Must scheme around it or lose. |

## Critical Matchups to Check

1. **WR1 vs CB1:** The primary outside matchup. If WR1 has AKR advantage of 10+, she will dominate.
2. **Slot WR vs Slot DB:** The quick-twitch matchup. Agility matters more than straight-line speed here.
3. **QB vs Spy/Rusher:** If QB has AKR advantage over the spy, designed runs will succeed. If spy is faster, QB is contained.
4. **RB vs nearest defender:** On designed runs, the RB's agility vs the closest defender's flag pull ability determines the play.

## Agility-Specific Mismatch

Separate from straight-line speed, agility mismatches affect short-area plays:
- Agility trait differential of 10+: +1.0 PPG in short-yardage and red zone situations
- This captures the bunch/West Coast advantage when the offense has superior agility in traffic

---

# GOVERNANCE

All interaction library entries, simulation parameters, drive outcome probabilities, scoring models, win probability formulas, and mismatch modifiers are v1 (PROVISIONAL). Based on limited NAIA data and flag football principles. Will be recalibrated as data deepens. Any change requires documentation, versioning, and approval.
