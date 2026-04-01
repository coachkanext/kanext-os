# NEXUS WOMEN'S FLAG FOOTBALL INTELLIGENCE - FILE 03: TEAM INTELLIGENCE
## v1.0

---

# TEAM KR - MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
Single authoritative document for Flag Football Team KR computation. Team KR is the position-group-weighted aggregation of players' Final System KRs under the selected Program Context.

Team KR does not evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player in rotation:
- Final KR (from Player Evaluation Engine)
- Component KRs (AKR, SKR, QKR if QB, DKR, IQKR)
- Position (QB, WR-Outside, WR-Slot, RB, Center, Rusher, DB/Safety)
- Two-way status and snap allocation (offense %, defense %)
- Archetype and archetype demand tier (A/B/C/No-match)
- Height, Weight (if available)

Per program (from Coach Context):
- Governing Body / Division / Conference
- Offensive System + Defensive System
- Competitive level (from KLVN level list)

Explicit exclusions: No archetype/badge/trait recomputation. No injury modeling.

## 2. Participation Threshold

- MIN_PARTICIPATION = 0.10 (10% of total snaps on their unit)
- Include player i in Team KR math iff they meet the threshold
- Starters and rotation players included. Scout-team-only excluded.
- In flag football, most players play significant minutes due to small rosters (20-30 players, 7 on field)

## 3. Position Group Aggregation

Flag football aggregates by position group. Each position group receives a fixed % of Total Team KR (from File 01 Position Group Weighting):

| Group | Weight | Players | Aggregation Method |
|---|---|---|---|
| QB | 25% | 1 starter | Starter KR only. Backup KR used for depth modifier. |
| Outside WR | 20% | 2 starters | Snap-weighted. WR1 carries 55% of group weight, WR2 45%. |
| Slot/Flex | 15% | 2 starters | Snap-weighted. Primary slot 55%, secondary 45%. |
| RB/Utility | 8% | 1 starter | Starter KR. |
| Center | 7% | 1 starter | Starter KR. |
| Defensive Coverage | 18% | 4-5 players | Snap-weighted average of all coverage players. Best cover player carries 30% of group. |
| Rush/Spy | 7% | 1-2 players | Snap-weighted. Primary rusher carries 65% of group. |

Total: 100%

### 3.1 Two-Way Player Allocation

Many flag football players play both offense and defense. Their KR must be allocated properly to avoid double-counting.

For two-way players:
- Determine their offensive KR and defensive KR separately (from component KRs and positional evaluation)
- Allocate their value to the position group where they have the HIGHER KR
- Apply a TWO-WAY BONUS of +2 KR points to the player's contribution to the secondary side (the lower-KR side)
- This captures the value of roster flexibility: a player who is a 78 on offense and a 72 on defense is more valuable than a pure 78 offensive player because she fills two roster spots

## 4. Offensive Team KR

Team_Offense_KR = sum of (Group_Offense_KR_g x Group_Weight_g) for offensive groups

Offensive groups: QB (25%), Outside WR (20%), Slot/Flex (15%), RB/Utility (8%), Center (7%) = 75% of total Team KR allocated to offense.

NOTE: Offense carries 75% of Team KR in flag football (vs 55% in tackle football). This reflects the reality that flag football is an overwhelmingly offensive sport. Scoring is high, defensive stops are hard to force, and the team that scores more usually wins. Defense matters, but offense is king.

## 5. Defensive Team KR

Team_Defense_KR = sum of (Group_Defense_KR_g x Group_Weight_g) for defensive groups

Defensive groups: Coverage (18%), Rush/Spy (7%) = 25% of total Team KR allocated to defense.

## 6. Overall Team KR

Team_KR = Team_Offense_KR + Team_Defense_KR

No special teams component (no kicking game in flag football).

## 7. Depth Modifier

Flag football rosters are small (20-30 players). Depth matters differently than tackle football.

**Depth Quality Score:**
- Count of players with KR 70+ beyond starters
- If roster has 7+ players above 70 KR (entire second unit): Depth = Elite (+2 Team KR)
- If roster has 4-6 players above 70 KR beyond starters: Depth = Good (+1 Team KR)
- If roster has 2-3 beyond starters: Depth = Average (no adjustment)
- If roster has 0-1 beyond starters: Depth = Thin (-1 Team KR)

**Two-Way Depth Penalty:**
- If more than 4 starters play both ways (offense and defense), apply -1 Team KR for fatigue risk
- If all 7 starters play both ways, apply -2 Team KR

**Injury Fragility:**
- Rosters of fewer than 15 active players: -2 Team KR (one injury = crisis)
- Rosters of 15-19: -1 Team KR
- Rosters of 20+: No penalty

## 8. System Fit Aggregation

System Fit% is the percentage of the starting 7 (offense) and starting 7 (defense) whose archetypes are A or B tier for the team's declared system.

- System Fit% = (count of A/B tier starters) / (total starters on that side) x 100
- Overall System Fit% = (Offensive Fit% x 0.75) + (Defensive Fit% x 0.25)

High system fit (90%+) = team plays above their raw talent
Low system fit (below 70%) = team plays below their raw talent

System Fit Adjustment:
- 95-100% fit: +2 Team KR
- 90-94% fit: +1 Team KR
- 80-89% fit: No adjustment
- 70-79% fit: -1 Team KR
- Below 70% fit: -2 Team KR

## 9. Final Team KR

Final_Team_KR = Base_Team_KR + Depth_Modifier + System_Fit_Adjustment

---

# OFFENSIVE SYSTEM INFERENCE ENGINE (OSIE)

## Purpose
Determine what offensive system a flag football team actually runs, based on observable tendencies.

## Inputs
- Play distribution (if available): pass vs run ratio, formation alignments
- Personnel groupings: how many WRs, RB usage, motion frequency
- QB rushing production relative to passing
- Route distribution: short/intermediate/deep mix
- Coaching staff background (if known)

## System Identification Criteria

**Spread:**
- 4+ receivers on field most plays
- Horizontal spacing (receivers spread to numbers and sideline)
- Balanced passing distribution across multiple receivers
- QB scramble as secondary option
- Pass-heavy (70%+ pass plays)

**Trips:**
- 3 receivers aligned to one side frequently (40%+ of plays)
- Overload concepts
- Route combinations with 2-3 receivers working the same zone
- Often paired with an isolated speed WR on the back side

**Bunch:**
- Receivers clustered near the line of scrimmage (within 2 yards of each other)
- Pick/rub concepts
- Short-area passing game
- YAC-dependent
- High completion percentage, lower YPA

**Motion-Heavy:**
- Pre-snap motion on 50%+ of plays
- Receivers changing alignment before the snap
- Designed to identify defensive coverage (man follows motion, zone stays put)
- Often combined with RPO-style reads

**QB Run-First:**
- QB rushing attempts 30%+ of total offensive plays
- Designed QB draws, scrambles, and option routes
- Receivers often running clearing routes
- Lower passing volume, higher QB rushing volume

**West Coast:**
- Short timing routes (0-10 yards) on 60%+ of passes
- High completion percentage, lower YPA
- YAC is the primary source of explosive plays
- Quick game, quick decisions
- Ball-control approach

## Confidence Bands

| Evidence Level | OSIE Confidence |
|---|---|
| Play-by-play data + film (3+ games) | 80-95% |
| Game recaps + stat distribution | 55-75% |
| Coaching background only | 35-50% |
| No evidence | System declared by user in Coach Context |

---

# DEFENSIVE SYSTEM INFERENCE ENGINE (DSIE)

## Purpose
Determine what defensive system a flag football team actually runs.

## System Identification Criteria

**Man Coverage:**
- Defenders follow receivers in pre-snap motion
- One defender clearly matched to each offensive player
- Low zone-drop movement post-snap
- High PBU rate (tight coverage), lower INT rate (not reading QB)

**Zone Coverage:**
- Defenders stay in zones when offensive motion occurs
- Post-snap movement is to zones, not to receivers
- Higher INT rate (reading QB eyes), lower PBU rate
- Zone drops and pattern matching visible on film

**Rush + Cover:**
- One defender consistently rushes from 7 yards
- Remaining 6 defenders in coverage
- Rusher designated pre-snap
- Most common defensive system in flag football

**Double Rush:**
- Two defenders rushing from 7 yards
- Only 5 in coverage against 6 eligible receivers
- High-risk, high-reward
- Usually paired with man coverage behind it
- Identifiable by high sack rate AND high scoring allowed

**Spy:**
- One defender clearly tracking the QB's movement rather than covering a receiver
- QB spy mirrors QB lateral movement
- Often used against mobile QBs
- Identifiable by low QB rushing production against this defense

---

# TEAM KR TIERS (LEGENDS)

## NAIA Team KR Legend (v1 - Provisional)

**88-100 - National Championship Contender.**
Elite talent across the roster. Deep bench. Strong system fit. Dominant on offense with capable defense. National tournament favorite.

**83-87 - National Tournament Team.**
Very good roster. Strong starters with adequate depth. Conference championship contender. Makes the national tournament.

**78-82 - Conference Contender.**
Solid team. Competitive in conference play. Could win conference in a favorable bracket. Fringe national tournament.

**73-77 - Above Average.**
Winning record. Competitive but not dominant. Loses to top teams. Middle of the conference.

**68-72 - Average.**
.500 or close to it. Has strengths but clear weaknesses. Bottom half of competitive conferences.

**63-67 - Below Average.**
Losing record. Lacks talent at key positions. Development-stage program.

**Below 63 - Rebuilding / First-Year Program.**
New or struggling program. Limited talent. Building from the ground up.

## NCAA Team KR Legend (v1 - Placeholder)

NOT YET POPULATED. NCAA flag football has not completed a competitive season as of spring 2026. This legend will be built once sufficient data exists. In the interim, use the NAIA legend scaled by KLVN lambda for cross-level interpretation.

---

# SCHOLARSHIP / FINANCIAL AID ALLOCATION

## Current Landscape (2025-26)

**NAIA:**
- $15,000 stipend per team distributed across players
- Athletic scholarships are partial (equivalency model)
- Supplemented by academic, institutional, and need-based aid
- 35 NAIA programs competing in 2025-26

**NCAA:**
- Scholarship limits TBD (NCAA has not yet set flag football scholarship limits)
- Emerging sport status means individual schools set their own financial aid approach
- Likely to be an equivalency sport (like volleyball, soccer) rather than headcount
- Schools combining athletic, academic, and need-based aid packages

**NJCAA:**
- Financial aid varies by institution
- Limited athletic scholarship funding for flag football

## Scholarship Allocation Framework (When Limits Are Set)

Until NCAA sets official scholarship limits, the allocation framework operates on a general model:

**Priority Allocation by Position:**
1. QB (highest single-player impact): Largest single scholarship allocation
2. WR1 / Primary Playmaker: Second-highest allocation
3. Primary Coverage Defender: Third-highest (defense wins close games)
4. Remaining starters: Equal allocation from remaining pool
5. Depth / Two-way contributors: Partial scholarships

**Two-Way Bonus:**
Players who contribute on both sides of the ball represent double roster value. Their scholarship allocation should reflect this - they're effectively filling two roster spots.

---

# ROSTER DECISION INTELLIGENCE

## Roster Construction Philosophy (Flag Football)

### Minimum Viable Roster
- 7 starters (required to field a team)
- 7 backups (one per position minimum)
- Total minimum: 14 players
- Recommended: 20-25 players for substitution, injury coverage, and position competition

### Position Priority in Roster Building
1. **QB** - most important position by far. Must have a starter AND a backup. QB injury without a capable backup = season over.
2. **Coverage defenders** - defense requires speed and coverage ability at 4-5 positions. One weak link in coverage = easy touchdowns.
3. **WR depth** - need 4-5 quality receivers to run the full route tree and maintain health.
4. **Two-way athletes** - at roster sizes of 20-25, two-way players are essential. Recruit athletes who can contribute on both sides.
5. **Center** - snap reliability is non-negotiable. Must have a starter and a backup who can snap cleanly.

### Recruiting Profile Priorities
Flag football recruiting should prioritize:
1. Speed (40-yard dash, 100m time, track background)
2. Agility (shuttle, 3-cone, soccer/basketball background)
3. Ball skills (hands, catching ability, ball tracking)
4. Football IQ (coachability, play recognition, adaptability)
5. Two-way willingness (athletes who will play both sides)

Common recruiting pipelines:
- High school flag football (39 sanctioned states, growing)
- Track and field athletes (speed + acceleration transfer directly)
- Soccer players (agility, endurance, field awareness)
- Basketball players (court vision, hands, lateral quickness)
- Softball players (hand-eye coordination, arm strength for QBs)
- Club/NFL FLAG tournament players

### Portal Decision Matrix

When evaluating transfer portal additions:
- Does this player fill a position need?
- Does this player's archetype fit our system (A or B tier)?
- Is this player's KR above our current starter at the position?
- Can this player contribute on both sides?
- How many years of eligibility remain?

---

# GOVERNANCE

All Team KR weights, aggregation methods, OSIE/DSIE criteria, team legends, scholarship frameworks, and roster intelligence are v1 (PROVISIONAL). Subject to recalibration as data deepens. Any change requires documentation, versioning, and approval.
