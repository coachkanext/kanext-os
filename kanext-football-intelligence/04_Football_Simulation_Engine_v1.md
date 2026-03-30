# NEXUS FOOTBALL INTELLIGENCE -- FILE 04: SIMULATION ENGINE
## v1.0

---

# INTERACTION LIBRARY

## 0. Scope
Single authoritative lookup table for all identity-clash interactions consumed by the Simulation Engine.

Three tables:
- Part 1: Scheme x Scheme (8 offense x 6 defense = 48 entries)
- Part 2: Offensive Archetype x Defensive System (40 archetypes x 6 systems = 240 entries -- offensive archetypes only)
- Part 3: Defensive Archetype x Offensive System (40 archetypes x 8 systems = 320 entries -- defensive archetypes only)

Governance: All archetype/system names must match locked libraries exactly. Deltas bounded by Modifier Framework. Deterministic: same inputs → same deltas.

---

## PART 1: SCHEME x SCHEME INTERACTION (48 entries)

Each entry: Advantage (Offense / Neutral / Defense), Run/Pass Impact, Turnover Pressure, Scoring Impact, Key Matchup Drivers.

### SPREAD (Offense) vs...

**vs 4-3:** Slight Offense Advantage
- Run/Pass: Spread's 4-WR looks force 4-3 into sub-packages (nickel) that weaken run defense
- Turnover Pressure: Neutral
- Scoring: +2-3 PPG for offense
- Key: 4-3 MIKE in coverage is the exploitable matchup. If 4-3 has a coverage LB, advantage narrows.

**vs 3-4:** Neutral
- Run/Pass: 3-4's versatility matches spread's multiple looks. OLB rush vs quick game = wash.
- Turnover Pressure: Slight + for defense (3-4 disguise creates read errors)
- Scoring: Neutral
- Key: Interior protection vs NT and blitz packages determines outcome.

**vs Nickel/4-2-5:** Neutral to Slight Defense
- Run/Pass: Nickel is BUILT to defend spread. Speed matches speed.
- Turnover Pressure: Neutral
- Scoring: Neutral
- Key: Spread must win the run game to exploit nickel's lighter front. If spread can't run, defense dominates.

**vs 3-3-5:** Neutral
- Run/Pass: 3-3-5's hybrid look gives multiple pre-snap pictures. Spread must identify the overload.
- Key: QB pre-snap reads are the differentiator. RPO elements help.

**vs 4-4:** Offense Advantage
- Run/Pass: 4-4's 8-man front is exposed by 4-WR spread. Only 3 DBs = mismatches.
- Scoring: +5-7 PPG for offense
- Key: Spread WRs in space vs undermanned secondary. If 4-4 has elite man-coverage corners, advantage narrows.

**vs 46:** Offense Advantage (with risk)
- Run/Pass: Aggressive man coverage behind 46 pressure is vulnerable to quick game and RPO.
- Turnover Pressure: + for both sides (46 creates turnovers but spread's quick game exploits pressure)
- Scoring: High-variance. Both sides score or turn it over.
- Key: QB processing speed determines outcome. Fast QB thrives; slow QB gets buried.

### AIR RAID vs...

**vs 4-3:** Slight Offense Advantage. Same rationale as Spread -- forces sub-packages. Even more extreme because Air Raid is 4-WR base.

**vs 3-4:** Slight Offense Advantage. Air Raid's quick timing beats 3-4 blitz packages when QB gets ball out fast.

**vs Nickel:** Neutral. Nickel matches Air Raid's personnel. Battle of execution.

**vs 3-3-5:** Slight Offense. 3-3-5 can match personnel but Air Raid's volume overwhelms if execution holds.

**vs 4-4:** Strong Offense Advantage. 4-4 has only 3 DBs. Air Raid's 4-WR sets create 4-on-3 advantages.

**vs 46:** Offense Advantage with extreme variance. 46's man coverage is either perfect or torched. No middle ground vs Air Raid.

### RPO vs...

**vs 4-3:** Neutral to Slight Offense. RPO reads exploit 4-3's gap discipline. If DE crashes, QB throws. If DE stays, QB gives.

**vs 3-4:** Slight Defense Advantage. 3-4's multiplicity of pre-snap looks makes RPO reads harder. Which OLB is rushing? Which is dropping?

**vs Nickel:** Slight Offense. Nickel's lighter front is vulnerable to RPO run game.

**vs 3-3-5:** Neutral. Both are built on multiplicity. Chess match of reads vs disguise.

**vs 4-4:** Offense Advantage. 4-4 commits 8 to the box. RPO punishes over-commitment to run.

**vs 46:** Neutral. 46 aggressively assigns gaps, but RPO reads punish over-commitment. Depends on QB.

### PRO STYLE vs...

**vs 4-3:** Neutral. Classic matchup. Both built from the same foundational football.

**vs 3-4:** Neutral. Pro Style's formation versatility tests 3-4's communication.

**vs Nickel:** Slight Offense. Pro Style's 2-TE sets create personnel mismatches. Nickel's lighter personnel struggles with inline TE blocking.

**vs 3-3-5:** Slight Offense. Pro Style's physicality and multiple formations tax 3-3-5's lighter front.

**vs 4-4:** Neutral. Pro Style can match 4-4's physicality and also throw over the top.

**vs 46:** Slight Defense. 46's aggression matches Pro Style's deliberate pace. 46 wins the physical battle more often.

### WEST COAST vs...

**vs 4-3:** Neutral. West Coast's timing routes are scheme-proof against standard defenses.

**vs 3-4:** Neutral. Same as above. West Coast doesn't care about front — it attacks zones and timing.

**vs Nickel:** Neutral. Both designed for the modern game.

**vs 3-3-5:** Slight Offense. West Coast's short timing attacks 3-3-5 before the exotic blitz arrives.

**vs 4-4:** Offense Advantage. West Coast's passing game as the run game shreds 4-4's heavy-front commitment.

**vs 46:** Slight Offense. Quick game beats pressure. If WRs create YAC, 46 is in trouble.

### POWER RUN vs...

**vs 4-3:** Neutral. Classic big-on-big battle. OL vs DL at the point of attack.

**vs 3-4:** Slight Defense. 3-4's two-gap technique is designed to absorb power run. NT eats doubles.

**vs Nickel:** Offense Advantage. Power Run's physicality exploits nickel's lighter front. Run game dominates.

**vs 3-3-5:** Offense Advantage. Same as Nickel -- lighter front struggles with physicality.

**vs 4-4:** Neutral. 4-4 is built to stop the run. Both are physical identities. Trench battle.

**vs 46:** Neutral to Slight Defense. 46 is designed to stop the run. Gap control meets gap scheme.

### OPTION / TRIPLE OPTION vs...

**vs 4-3:** Slight Offense. 4-3 is vulnerable to option because DE must be disciplined. Option reads exploit undisciplined ends.

**vs 3-4:** Neutral. 3-4 OLBs as edge defenders handle option reads better than 4-3 DEs.

**vs Nickel:** Offense Advantage. Nickel's lighter personnel cannot handle the physicality of option football.

**vs 3-3-5:** Slight Offense. 3-3-5's lighter front struggles. But hybrid S/LB can be the option-read defender.

**vs 4-4:** Neutral to Slight Defense. 4-4's 8-man front has enough bodies. Disciplined gap control beats option.

**vs 46:** Defense Advantage. 46's aggressive gap control with 6+ at the LOS is the most anti-option scheme.

### PISTOL vs...

**vs 4-3:** Neutral. Pistol's versatility (can look like power, zone, or option) keeps 4-3 honest.

**vs 3-4:** Neutral. Same versatility challenge.

**vs Nickel:** Slight Offense. Pistol run game exploits lighter front.

**vs 3-3-5:** Neutral. Both are versatile. Chess match.

**vs 4-4:** Neutral. Pistol can run or pass from same look. 4-4 must guess.

**vs 46:** Neutral. Pistol's ability to attack in multiple ways balances 46's aggression.

---

## PART 2: OFFENSIVE ARCHETYPE x DEFENSIVE SYSTEM (Key Entries)

Format: Archetype | System | Fit % | Impact Notes

### QB Archetypes

| Archetype | 4-3 | 3-4 | Nickel | 3-3-5 | 4-4 | 46 |
|---|---|---|---|---|---|---|
| Dual-Threat QB | 80% | 75% | 85% | 85% | 90% (exploits) | 80% |
| Pocket Passer | 85% | 80% | 85% | 80% | 75% | 65% (vulnerable) |
| Scrambler | 75% | 70% | 78% | 80% | 85% | 72% |
| Game Manager | 80% | 80% | 80% | 75% | 80% | 70% |
| Gunslinger | 82% | 78% | 80% | 78% | 85% | 70% (high-risk) |
| RPO Specialist | 85% | 70% | 80% | 80% | 90% | 75% |

### Skill Position Archetypes (Summary)

- **Power Back** vs Nickel/3-3-5: 90%+ (physical mismatch). vs 4-4/46: 70% (designed to stop run).
- **Speed Back** vs 4-4/46: 65% (no space). vs Nickel: 85% (space to exploit).
- **X-Receiver** vs 4-4: 90%+ (3 DBs = island matchup). vs Nickel: 75% (matched).
- **Slot Receiver** vs 3-3-5: 85% (exploits hybrid matchups). vs 4-4: 90%.
- **Deep Threat** vs 46: 85% (man coverage = 1-on-1 shot). vs Nickel: 70% (covered).

## PART 3: DEFENSIVE ARCHETYPE x OFFENSIVE SYSTEM (Key Entries)

- **Edge Rusher** vs Air Raid: 90% (heavy pass rush opportunity). vs Option: 60% (must set edge, no rush).
- **Shutdown Corner** vs Spread/Air Raid: 90%+ (island coverage needed). vs Power Run: 70% (not featured).
- **Nose Tackle** vs Power Run: 90%+ (holding POA is everything). vs Air Raid: 55% (off field in sub-packages).
- **Coverage LB** vs Spread/Air Raid: 90% (coverage reps). vs Power Run: 65% (not enough).
- **Box Safety** vs Power Run/Option: 90% (run support). vs Air Raid: 60% (coverage liability).

---

# DRIVE RESOLUTION MODEL

## Football Drive Simulation (v1)

### Starting Field Position
Average starting field position by level:
- FBS P4: Own 27-yard line
- FBS G5: Own 25-yard line
- FCS and below: Own 24-yard line

Starting position modified by: kickoff coverage/return, turnover location, punt net average.

### Down-and-Distance Sequence
Each drive is a sequence of plays resolved as:
1. First down: Run/pass based on team tendency (OSIE). Expected gain from Team Offense KR vs Team Defense KR differential.
2. Resolution: Gain/Loss/Incomplete/Turnover. Probability weighted by archetype matchups.
3. Continue until: First down (reset), 4th down (punt/FG/go-for-it), touchdown, turnover, end of half.

### Scoring Probability by Field Zone

| Field Zone | Scoring Probability (average) | TD Probability | FG Probability |
|---|---|---|---|
| Own 1-20 | 18% | 8% | 3% |
| Own 21-40 | 28% | 14% | 6% |
| Own 41 - Opp 40 | 38% | 20% | 10% |
| Opp 39-20 | 52% | 28% | 18% |
| Opp 19-1 (Red Zone) | 82% | 56% | 22% |

Modified by: Team Offense KR, Team Defense KR, scheme matchup interaction.

### Turnover Model
Base turnover rate per drive: 12% (FBS average).
Modified by:
- QB turnover tendency (INT rate + fumble rate)
- OL pass protection (pressures → forced throws)
- Defensive ball skills (INTs, forced fumbles)
- Weather (rain/wind increase fumble rate +3%, INT rate +2%)

---

# WIN PROBABILITY MODEL

## Pre-Game Win Probability
WinProb_Home = 0.50 + (Team_KR_Home - Team_KR_Away) x 0.015 + Home_Field_Advantage

Home Field Advantage by level:
- FBS P4: +3% (some venues +5%: Death Valley, The Swamp, The Horseshoe)
- FBS G5: +3%
- FCS: +4% (smaller venues, louder relative to field)
- D2 and below: +2%

## In-Game Win Probability
Updated after every scoring play using: current score, time remaining, possession, field position, timeouts remaining, Team KR differential.

---

# PHYSICAL MISMATCH MODIFIERS

## OL vs DL Weight Differential (biggest mismatch in football)
- If OL average weight > DL average weight by 20+ lbs: +2% run game efficiency
- If DL average weight > OL average weight by 20+ lbs: +3% pressure rate
- If individual OT outweighed by EDGE by 15+ lbs AND EDGE speed > 80: Critical Mismatch Flag

## DB vs WR Speed Differential
- WR 40-time 0.10+ seconds faster than covering DB: +8% deep completion probability
- WR 40-time 0.05-0.09 faster: +4% deep completion probability
- DB faster than WR: -5% deep completion probability

## LB vs TE Coverage Mismatch
- If TE Agility > LB Agility by 5+ KR points AND TE Route Running > 75: Mismatch Flag (+6% intermediate completion)
- If TE speed > LB speed by 0.15+ seconds: Seam route advantage (+10% seam completion)

## Edge Rusher vs OT Matchup
- EDGE speed + bend composite > OT pass-pro technique by 10+ KR: Dominant Edge Flag (+4% pressure rate)
- OT technique + anchor > EDGE rush by 10+ KR: Neutralized Edge Flag (-3% pressure rate)

---

# RED ZONE MODEL

## Scoring Probability Inside the 20
Base rates (FBS average):
- TD rate from inside 20: 56%
- FG rate: 22%
- No score (turnover/turnover on downs): 22%

Modified by:
- Team Red Zone Offense KR (RB power, OL drive, TE blocking, QB accuracy-short)
- Team Red Zone Defense KR (IDL run stuffing, LB gap discipline, CB man coverage in compressed field)
- Power Run offense in red zone: TD rate +5%
- Air Raid in red zone: TD rate -3% (compressed field limits Air Raid's horizontal spacing)

## Goal-Line (Inside the 5)
- Power Back + Mauler OL: TD rate 72%
- Spread/passing team: TD rate 58%
- Elite goal-line defense (strong IDL + MIKE): TD rate reduced by 8%

---

# SPECIAL TEAMS IMPACT MODEL

## Field Goal Model
- FG probability = base rate by distance x Kicker KR modifier
- Base rates: 0-29 yds: 97%. 30-39: 88%. 40-49: 72%. 50+: 48%.
- Kicker KR 90+: +5% at all distances. KR 80-89: +2%. KR 70-79: base. KR < 70: -5%.

## Punt Model
- Net punt average determines opponent starting field position
- Punter KR 90+: opponent starts at own 18 on average
- Punter KR 80-89: own 22. KR 70-79: own 25. KR < 70: own 28.
- Inside-20 rate modifier: elite punter adds 1.5 points of field position value per game.

## Return Threat Model
- Return TD probability per game: 3% baseline
- Dynamic Returner archetype: +4% (total 7%)
- Return average > 28 yards (kick) or > 12 yards (punt): Field position advantage of 5+ yards per return.

---

# GOVERNANCE

All interaction deltas, drive probabilities, and mismatch modifiers are v1 estimates. Empirical calibration required against actual game data. All values deterministic: same inputs → same outputs.
