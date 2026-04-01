# KaNeXT Women's Flag Football Intelligence Knowledge Base
## v1.0 - March 2026

---

## OVERVIEW

This document is the consolidated knowledge base for the KaNeXT Women's Flag Football Intelligence System. It describes the system architecture, capabilities, and how Nexus processes flag football intelligence requests.

The Women's Flag Football Intelligence System is one of KaNeXT's sport-specific intelligence modules. It shares the same architectural principles as basketball, tackle football, baseball, soccer, and other sport intelligence systems: same evaluation pipeline, same KR (KaNeXT Rating) scale, same KLVN lambda normalization, same governance rules. The content is entirely flag football-specific.

---

## WHAT IS WOMEN'S FLAG FOOTBALL?

Women's flag football is one of the fastest-growing sports in the United States and globally. Key facts:

**Format:** 7-on-7 (college level). All players are eligible receivers. No blocking. No tackling. Defenders pull flags to down the ball carrier.

**Field:** Standard college flag football uses a tackle football field (100 yards x 53.3 yards with 10-yard end zones) per the NCAA College Flag Football Rule Book. Some recreational and youth leagues use smaller fields (70x30 or 80x40).

**Governance:**
- NCAA: Added to Emerging Sports for Women program in January 2026. 60+ schools expected for spring 2026. Path to championship status requires 40 varsity programs meeting minimum contest requirements.
- NAIA: Launched varsity flag football in 2021. 35 programs competing in 2025-26. Invitational sport status with qualification-based postseason.
- NJCAA: 7+ institutions participating in 2025-26.
- High School: 39 states sanction girls' flag football. Participation surged 60% from 2024-2025.
- Olympics: Flag football added for 2028 Los Angeles Games.
- Professional: NFL and TMRW Sports announced a professional flag football league (men's and women's) in March 2026. WFA FLAG National Tour running. Regional pro leagues emerging (SCWPFFL in Southern California).

**What Makes It Different From Tackle Football:**
- 7v7, not 11v11. Much smaller teams. Every player is on the field every play.
- No blocking. The center snaps the ball and becomes an eligible receiver. No offensive line.
- No tackling. Defenders pull flags to stop the play.
- All players are eligible receivers. The QB can run.
- No punting or kicking. Fourth-down decisions are go-for-it or turnover on downs.
- Speed and agility dominate. Size and strength matter far less than in tackle football.
- Route running and coverage skills are the primary differentiators.
- Two-way play is extremely common due to small rosters.

---

## INTELLIGENCE SYSTEM ARCHITECTURE

The Women's Flag Football Intelligence System consists of 6 core files plus the SKILL.md that routes requests:

### File Map

| File | Name | Purpose |
|------|------|---------|
| SKILL | Nexus Flag Football Intelligence Skill | Mode routing, data gathering protocol, governance rules |
| 01 | Player Eval Process | Pipeline steps, Coach Context, Player Profile, Confidence Gates, Suppression Detection |
| 02 | Player Eval Reference | Trait Library (39 traits), Archetype Library (20 archetypes), System Demands, Badges, KLVN, Legends, OPF |
| 03 | Team Intelligence | Team KR pipeline, OSIE/DSIE, Team Legends, Scholarship framework, Roster Intelligence |
| 04 | Simulation Engine | Interaction Library (138 entries), Drive resolution, Win probability, Speed mismatch modifiers |
| 05 | Scouting & Game Ops | Confidence Gates, 4-phase Game Ops flow |
| 06 | Downstream Engines | Development Engine, Pro Transition Engine, Flag-to-Tackle Crossover, Coaching Impact |

### Supporting Files

| File | Purpose |
|------|---------|
| Legend_NCAA_FlagFB_v1 | NCAA KR legend (projected - no completed season yet) |
| Legend_NAIA_FlagFB_v1 | NAIA KR legend (based on 4+ years of data) |
| College_FlagFB_KLVN_Lambdas_v1 | Lambda normalization table for all flag football levels |

---

## POSITIONS (7 ON-FIELD)

### Offense
1. **QB (Quarterback):** Passer and runner. No pocket protection. Must evade rushers on every drop. Calls plays at the line in many systems. The most important position by far.
2. **C (Center):** Snaps the ball, then runs routes as an eligible receiver. No blocking. Snap reliability is critical. A bad snap is a lost play.
3. **WR-X (Outside Receiver 1):** Primary route runner. Boundary side. Speed and route precision.
4. **WR-Y (Outside Receiver 2):** Primary route runner. Field side.
5. **WR-Slot (Slot Receiver):** Inside route runner. Quick-game specialist. Short-area quickness and YAC ability.
6. **RB (Running Back):** Versatile. Receives handoffs, runs routes, catches passes from backfield.
7. **FLEX (Flex Player):** Hybrid role. Can line up as additional WR, RB, or motion player.

### Defense
1. **Rusher (Rush End):** Lines up 7 yards off the ball. Rushes the QB. Speed off the snap.
2. **CB1 (Cornerback 1):** Covers the opponent's best receiver.
3. **CB2 (Cornerback 2):** Coverage. Man or zone.
4. **Slot DB (Slot Defender):** Covers slot receiver. Quick feet and mirror ability.
5. **Safety (S):** Centerfield coverage. Last line of defense. Ball-hawk role.
6. **LB/Spy (Linebacker/Spy):** Hybrid. Can rush, cover intermediate, or spy the QB.
7. **Flex D (Flex Defender):** Adjustable role based on opponent formation.

### Two-Way Players
Extremely common in flag football, especially at NAIA and NCAA D2/D3 roster sizes. Many players play offense and defense. The system evaluates both sides.

---

## COMPONENT KRs

Five component KRs measure distinct dimensions of flag football ability:

1. **AKR (Athletic KR):** Speed, agility, quickness, change of direction, acceleration. THE dominant trait in flag football. Weighted highest at nearly every position.

2. **SKR (Skill KR):** Route running, catching, ball handling, flag pulling technique, evasion moves (juke, spin, stutter-step).

3. **QKR (QB KR - QBs only):** Arm strength, accuracy, release speed, scrambling, decision-making under rush pressure with no protection.

4. **DKR (Defensive KR):** Coverage ability (man and zone), flag pulling consistency, rush timing, reading the QB.

5. **IQKR (Flag Football IQ):** Play design and calling, route adjustments, pre-snap reads, clock management, two-way transition speed, situational awareness.

---

## OFFENSIVE SYSTEMS (6)

1. **Spread** - 4+ receivers spread across the field. 1-on-1 isolations. Most common system.
2. **Trips** - 3 receivers to one side. Route combinations and traffic. Overload concepts.
3. **Bunch** - Clustered receivers near LOS. Pick/rub concepts. Short-area passing. YAC-dependent.
4. **Motion-Heavy** - Constant pre-snap movement. Identifies coverage. Creates confusion.
5. **QB Run-First** - Designed QB runs. Scramble-pass combos. QB is the primary weapon.
6. **West Coast** - Short timing routes. High completion %. YAC as primary source of big plays.

## DEFENSIVE SYSTEMS (5)

1. **Man Coverage** - Each defender assigned to a player. Best-on-best.
2. **Zone Coverage** - Defenders cover areas. Read the QB, break on the ball.
3. **Rush + Cover** - One designated rusher. Six in coverage.
4. **Double Rush** - Two rushers. High risk (5 vs 6 in coverage), high reward.
5. **Spy** - One defender shadows the QB to prevent designed runs.

---

## KR SCALE AND EVALUATION

### How KR Works
KR (KaNeXT Rating) is a universal 0-100 scale that measures a player's overall flag football ability. The same KR means the same thing at every level - what changes is how each level's LEGEND interprets that KR.

### Evaluation Pipeline (V1 - Box Score)
1. Coach Context (level, system, conference)
2. Phase 3 - Production Anchor (map stats to legend tiers)
3. Phase 6 - Component KR Math (trait scoring with OPF weights)
4. Phase 6 adjusts within Phase 3 +/- 10
5. Final KR with Level Tier Map

### Key Principles
- Legend anchor is truth. Math is confirmation. Not the other way around.
- KLVN normalizes inputs, not outputs. One player, one KR, multiple legend reads.
- No data fabrication. Missing data = UNSCORED.
- Downstream engines never modify upstream outputs.
- Speed and agility are THE dominant physical traits. This is not tackle football.

---

## PRO PATHWAYS

### Current (2026)
- **NFL/TMRW Sports Pro League:** Announced March 2026. Men's and women's leagues. Launch timeline aligned with 2028 Olympics.
- **2028 Olympics:** Flag football added for Los Angeles Games. Team USA selected by USA Football.
- **WFA FLAG National Tour:** Club-based national competition. 16-team championship at Pro Football Hall of Fame.
- **SCWPFFL:** Regional professional league in Southern California. 8 county teams. Launching summer 2026.
- **International (IFAF):** World Championship events. National team selection through USA Football.

### Pro Viability Thresholds
- NFL/TMRW Pro League: KR 82+ (minimum), 88+ (ideal)
- Team USA / Olympics: KR 85+ (minimum), 90+ (ideal)
- WFA FLAG National: KR 75+
- Regional Pro: KR 72+

---

## EMERGING SPORT CONTEXT

Women's flag football is in a period of explosive growth. The intelligence system is designed to operate under data limitations:

- **NAIA (since 2021):** Deepest data. 35 programs. 4+ years of competition. The calibration baseline.
- **NCAA (since 2026):** Emerging sport. 60+ programs expected by spring 2026. Limited data. Legends are projected.
- **NJCAA:** 7+ programs. Limited data.
- **High School:** 39 states sanctioned. 60% participation increase 2024-2025. Pipeline growing rapidly.

Confidence percentages are lower than established sports. Legends are provisional. KLVN lambdas are estimated. All of this improves as data deepens.

The system is built to scale. As women's flag football matures from an emerging sport to an established NCAA championship sport, the intelligence files will be calibrated with real competitive data, legends will be refined, and confidence ranges will tighten.

---

## GOVERNANCE

All content in the Women's Flag Football Intelligence Knowledge Base is v1 (PROVISIONAL). Subject to recalibration as data matures. Maintained in parallel with all other KaNeXT sport intelligence systems.

Version History:
- v1.0 (March 2026): Initial architecture. Built from the ground up for 7v7 women's flag football. NCAA College Flag Football Rule Book (2025) used as rules reference. NAIA competition data (2021-present) as calibration baseline.
