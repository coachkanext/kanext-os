# NEXUS FOOTBALL INTELLIGENCE -- FILE 03: TEAM INTELLIGENCE
## v1.0

---

# TEAM KR -- MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
Single authoritative document for Football Team KR computation. Team KR is the position-group-weighted aggregation of players' Final System KRs under the selected Program Context.

Team KR does not evaluate players. It consumes finalized player outputs from upstream.

## 1. Inputs (Non-Negotiable)

Per player in rotation:
- Final_System_Offense_KR_i (from Player System Fit layer)
- Final_System_Def_KR_i
- Snap count and snap share % (by offensive/defensive/special teams)
- Position group (QB, RB, WR, TE, OL, EDGE, IDL, LB, CB, S, K, P, RS)
- Offensive archetype demand tier (A/B/C/No-match)
- Defensive archetype demand tier (A/B/C/No-match)
- Height, Weight, Arm Length (if available)

Per program (from Coach Context):
- Governing Body / Division / Conference Classification
- Offensive System + Defensive System
- Competitive level (from KLVN level list)

Explicit exclusions: No archetype/badge/trait recomputation. No injury modeling.

## 2. Participation Threshold

- MIN_PARTICIPATION = 0.05 (5% of total snaps at their unit)
- Include player i in Team KR math iff snap_share_i >= MIN_PARTICIPATION for their unit (offense/defense/ST)
- Starters and rotational players included. Scout-team-only excluded.

## 3. Position Group Aggregation

Football aggregates by position group, not individual weight. Each position group receives a fixed % of Total Team KR (from File 01 Position Group Weighting):

| Group | Weight | Players | Aggregation Method |
|---|---|---|---|
| QB | 18% | 1 starter | Starter KR only. Backup KR used for depth modifier. |
| OL | 16% | 5 starters | Unit average. Weakest-link penalty applies (see 3.1). |
| EDGE | 10% | 2 starters + rotation | Snap-weighted average. |
| WR | 9% | 3 starters | Snap-weighted. WR1 carries 45% of group weight, WR2 30%, WR3 25%. |
| CB | 8% | 2-3 starters | Snap-weighted. CB1 carries 45% of group weight. |
| IDL | 7% | 2 starters + rotation | Snap-weighted average. |
| RB | 7% | 1-2 starters | Snap-weighted. Primary back carries 65% of group weight. |
| S | 6% | 2 starters | Equal weight (FS + SS). |
| LB | 6% | 2-3 starters | Snap-weighted. Scheme determines count (4-3 = 3 LB, 3-4 = 4 LB, 4-2-5 = 2 LB). |
| TE | 5% | 1-2 starters | Snap-weighted. Scheme determines TE importance (Pro Style TE weight +1%, Air Raid TE weight -2%). |
| K | 4% | 1 | Single player. |
| P | 2% | 1 | Single player. |
| RS | 2% | 1-2 | Best return specialist. |

### 3.1 OL Weakest-Link Penalty

OL is unique because the weakest member determines pass protection. A chain is only as strong as its weakest link.

If the lowest-KR OL starter is 8+ KR points below the group average, apply a Weakest-Link Penalty:
- 8-12 point gap: -1.0 from OL group KR
- 13-17 point gap: -2.0 from OL group KR
- 18+ point gap: -3.0 from OL group KR

This captures the reality that one bad OL kills the pass game regardless of the other four.

## 4. Offensive Team KR

Team_Offense_KR = Σ (Group_Offense_KR_g x Group_Weight_g) for all offensive groups

Offensive groups: QB (18%), OL (16%), WR (9%), RB (7%), TE (5%) = 55% of total Team KR allocated to offense.

## 5. Defensive Team KR

Team_Defense_KR = Σ (Group_Defense_KR_g x Group_Weight_g) for all defensive groups

Defensive groups: EDGE (10%), CB (8%), IDL (7%), S (6%), LB (6%) = 37% of total Team KR allocated to defense.

## 6. Special Teams KR

ST_KR = (K_KR x 4%) + (P_KR x 2%) + (RS_KR x 2%) = 8% of total Team KR.

## 7. Overall Team KR

Team_KR = Team_Offense_KR + Team_Defense_KR + ST_KR

Level-contextual adjustment: At levels where offense/defense balance differs structurally (e.g., FCS where defense is relatively more important due to field position emphasis), apply a minor rebalance:

| Level | Offense % | Defense % | ST % |
|---|---|---|---|
| FBS P4 | 55% | 37% | 8% |
| FBS G5 | 54% | 37% | 9% |
| FCS | 52% | 38% | 10% |
| D2 and below | 50% | 38% | 12% |

## 8. Depth Modifier

Football rosters are deep (85 scholarships). Depth matters more than basketball.

Depth Score per position group = (Backup KR / Starter KR) averaged across the group.

If Depth Score < 0.80 for any group: Fragility Flag raised.
If 3+ groups have Depth Score < 0.80: Team Fragility Flag raised. Team KR adjusted -1.0.
If QB backup KR < 75% of starter KR: Critical QB Fragility. Team KR adjusted -1.5 (additive with team fragility).

## 9. Diagnostics Output

For every Team KR computation:
- Group-by-group KR breakdown
- Starter KR vs Backup KR per group
- Weakest-link flags (OL, secondary)
- Demand Profile coverage (A/B/C match rates per system)
- Fragility flags
- Level Tier Map interpretation

## 10. Execution Order

| Step | Action | Source |
|---|---|---|
| 1 | Load Coach Context | Coach Context Setup |
| 2 | Load all player Final System KRs | Player Pipeline (File 01) |
| 3 | Filter by participation threshold | Snap data |
| 4 | Assign to position groups | Roster data |
| 5 | Compute group KRs (snap-weighted) | Player KRs + snap shares |
| 6 | Apply OL Weakest-Link Penalty | OL group data |
| 7 | Compute Offensive/Defensive/ST KRs | Group KRs x weights |
| 8 | Compute Depth Modifier | Backup KRs |
| 9 | Compute Overall Team KR | Sum of unit KRs + depth |
| 10 | Run Diagnostics | All data |
| 11 | Level Interpretation | Team KR Legend |
| 12 | Confidence Gate | Data tier |

---

# OFFENSIVE SYSTEM IDENTIFICATION ENGINE (OSIE)

OSIE -- Football v1

Purpose: Identify which of the 8 offensive systems a team is running based on observable tendencies. Used when Coach Context is unknown or needs verification.

## Identification Triggers

### 1) SPREAD
- 10+ personnel (1 RB, 0 TE, 4 WR) used on 40%+ of plays
- Shotgun formation on 70%+ of plays
- RPO elements on 15%+ of plays
- Tempo (plays per minute) in top-30% of conference
- Run/pass ratio closer to 50/50 than 60/40
- WR screens and quick game make up 20%+ of pass attempts

### 2) AIR RAID
- 4-WR sets on 50%+ of plays
- Pass rate above 55%
- Shotgun on 80%+ of plays
- Quick game (sub-2.5s throws) on 35%+ of pass plays
- Mesh/crosser concepts identified as primary route combination
- Run game is < 35% of offensive plays and primarily QB scrambles/draws

### 3) RPO (RUN-PASS OPTION)
- RPO tags on 20%+ of run plays
- Pre-snap reads by QB observable on 30%+ of plays
- Zone run scheme as base run concept
- High rate of packaged plays (run + quick pass in same play design)
- QB pull rate on zone reads 25%+
- Play-action and RPO combined > 40% of dropbacks

### 4) PRO STYLE
- Under-center on 40%+ of plays
- 2-TE sets (12 personnel) used on 25%+ of plays
- Play-action rate 30%+
- Balanced run/pass ratio (45-55% run)
- Multiple formation looks per game (varied personnel groupings)
- Fullback/H-back usage on 10%+ of run plays

### 5) WEST COAST
- Short passing (0-9 air yards) on 45%+ of pass attempts
- YAC per reception in top-25% of conference
- Completion rate above 65%
- Screen game (RB/WR screens) on 12%+ of plays
- Play-action off horizontal passing game
- Short-to-intermediate route combinations dominate

### 6) POWER RUN
- Run rate above 55%
- Gap-scheme runs (power, counter, trap) on 50%+ of designed runs
- Under-center or pistol on 50%+ of plays
- TE used as inline blocker on 60%+ of run plays
- Pulling linemen on 20%+ of run plays
- Play-action rate 25%+ (built off heavy run)

### 7) OPTION / TRIPLE OPTION
- Designed QB runs (non-scramble) on 20%+ of offensive plays
- Option reads (pitch/keep/give) identified on 30%+ of run plays
- Minimal passing game (pass rate < 35%)
- Cut-block scheme in OL technique
- Speed at skill positions (sub-4.5 40 at RB/slot)
- Minimal use of shotgun formation

### 8) PISTOL
- Pistol formation (QB 4 yards behind center) on 40%+ of plays
- Run game versatility (zone + power from same look)
- Play-action rate 28%+ (built off run-game depth)
- QB designed runs on 10%+ of plays
- Formation flexibility (can shift to under-center or shotgun from pistol base)
- Balanced run/pass with run emphasis

## OSIE Confidence

| Evidence Level | Confidence |
|---|---|
| Multi-game film + PFF charting | 85-95% |
| Season tendency data (PFF/ESPN) | 70-85% |
| Public coaching philosophy + formation reports | 55-70% |
| Coach history only | 40-55% |

---

# DEFENSIVE SYSTEM IDENTIFICATION ENGINE (DSIE)

DSIE -- Football v1

## Identification Triggers

### 1) 4-3 (OVER/UNDER)
- 4 down linemen on 50%+ of base snaps
- 3 LB (MIKE + WILL + SAM) as base personnel
- Even front alignment (4 across)
- Gap-sound run defense as identity
- Less frequent exotic blitz packages
- Sub-packages (nickel) used on clear passing downs only

### 2) 3-4 (ODD FRONT)
- 3 down linemen + 4 LBs as base personnel on 40%+ of snaps
- OLBs as primary edge rushers
- Two-gap technique from DL (read and react vs attack)
- Multiple blitz packages from LB level
- Versatility in showing different pre-snap looks
- NT/0-technique as anchor

### 3) NICKEL / 4-2-5
- 5+ DBs on field for 60%+ of defensive snaps
- Nickel corner as base personnel (not sub-package)
- Lighter, faster front
- Run defense from DBs expected (safeties in box)
- Built for the modern passing game
- Only 2 LBs on base snaps

### 4) 3-3-5 (WIDE TACKLE SIX)
- 3 DL + 3 LB + 5 DB as base
- Hybrid safety/LB as a key position
- Overload blitz packages and exotic pressures
- Multiple pre-snap looks and movement
- Safety walked into the box on 30%+ of snaps
- Zone-blitz principles

### 5) 4-4 (EIGHT-MAN FRONT)
- 8 defenders near the LOS on 40%+ of plays
- 4 DL + 4 LB as base
- Run-first defensive identity
- Only 3 DBs in base (1 S + 2 CB)
- Man coverage behind the front
- Aggressive downhill LB play

### 6) 46 DEFENSE
- 6+ defenders at or near LOS on 50%+ of snaps
- SS as box defender (8th man in the box)
- Aggressive gap control
- Man coverage on the back end with minimal safety help
- Pressure from multiple positions
- Corners must survive on islands

## DSIE Confidence

Same confidence table as OSIE.

---

# TEAM KR LEGENDS

## FBS Power 4 -- Team KR Legend

**94-100 -- National Championship Favorite.**
Controls games on both sides. Redundant talent at every position group. Survives playoff variance. Championship is probable, not aspirational.

**91-93 -- CFP Semifinal Caliber.**
Top-4 seed profile. Multiple high-level position groups. Some matchup risk but deep run is realistic.

**88-90 -- CFP / NY6 Bowl Team.**
10+ wins. Strong regular-season resume. Ceiling depends on draw and health. Conference title contender.

**85-87 -- Bowl Team / Upper Half of Conference.**
8-9 wins. One or two strong position groups. Competitive in most games. Bowl-eligible comfortably.

**82-84 -- .500 / Bubble Bowl Team.**
6-7 wins. High volatility. Fatal flaw in one position group. Record depends on close-game variance.

**79-81 -- Losing Record.**
4-5 wins. Structural limitations. Competitive in half the games. No postseason path.

**76-78 -- Clear Losing Record.**
2-3 wins. Talent gaps across multiple groups. Wins are upsets.

**Below 76 -- Non-Competitive.**
Rebuilding year. Roster talent caps outcomes.

## FBS Group of 5 -- Team KR Legend

**93-100 -- CFP / NY6 Contender.** Undefeated or 1-loss G5 team. National recognition.
**89-92 -- Conference Champion / Bowl Contender.** 10+ wins. Dominant in conference.
**85-88 -- Strong Bowl Team.** 8-9 wins. Competitive.
**81-84 -- Winning Record / Bowl Eligible.** 6-7 wins.
**77-80 -- .500 or Below.** 4-5 wins.
**Below 77 -- Non-Competitive.**

## FCS -- Team KR Legend

**92-100 -- FCS National Championship Contender.** Playoff team. Deep run expected.
**88-91 -- FCS Playoff Team.** Conference champion or at-large. Wins 1-2 playoff games.
**84-87 -- Strong FCS Team.** Winning record. Playoff bubble.
**80-83 -- .500 FCS Team.** Competitive. Middle of conference.
**Below 80 -- Below .500.**

## D2/D3/NAIA/NJCAA -- Team KR Legends follow same tier pattern with thresholds shifted down 2-4 KR points per level step, anchored to national championship at top and non-competitive at bottom.

---

# SCHOLARSHIP ALLOCATION ENGINE

Scholarship Allocation -- Football v1 (85 FBS Scholarships)

## Target Allocation by Position Group

| Group | Scholarships | % of 85 | Rationale |
|---|---|---|---|
| QB | 3-4 | 4-5% | Starter + 2 backups + developmental. Most important position. |
| RB | 3-4 | 4-5% | Starter + change-of-pace + developmental. Shorter career arc. |
| WR | 8-10 | 9-12% | 3 starters + depth. High attrition (portal, injury). |
| TE | 3-4 | 4-5% | 1-2 starters + depth. Scheme-dependent (Pro Style needs more). |
| OL | 14-16 | 16-19% | 5 starters + swing tackle + 8-10 developmental. Longest development time. Protect the investment. |
| EDGE | 5-6 | 6-7% | 2 starters + rotation + developmental. Premium position. |
| IDL | 5-6 | 6-7% | 2 starters + rotation. Heavy-rotation position. |
| LB | 6-8 | 7-9% | 2-4 starters (scheme-dependent) + depth. |
| CB | 5-6 | 6-7% | 2-3 starters + depth. High-value, hard-to-develop position. |
| S | 4-5 | 5-6% | 2 starters + depth. |
| K/P/LS | 2-3 | 2-4% | 1 K + 1 P + (optional LS scholarship). Walk-on candidates. |

**Flex Scholarships: 5-8** -- Allocated based on roster needs, portal acquisitions, and strategic depth.

## Priority Allocation Rules

1. Never drop below minimum viable depth at any position group (see Roster Decision Intelligence below).
2. QB investment is protected -- always maintain 3 scholarship QBs.
3. OL investment is protected -- always maintain 14+ scholarship OL. OL takes the longest to develop and is the hardest to replace mid-season.
4. Flex scholarships go to the position group with the largest gap between current roster KR and conference-average KR at that group.
5. Scholarship allocation is annual. Each year's class must address both immediate needs and developmental pipeline.

---

# ROSTER DECISION INTELLIGENCE

Roster Decision Intelligence -- Football v1

## Minimum Viable Depth Per Group

| Group | Minimum Viable | Critical Threshold (below = emergency) |
|---|---|---|
| QB | 3 scholarship | 2 (one injury from crisis) |
| RB | 3 | 2 |
| WR | 7 | 5 |
| TE | 3 | 2 |
| OL | 12 | 10 (cannot practice full team) |
| EDGE | 4 | 3 |
| IDL | 4 | 3 |
| LB | 5 | 4 |
| CB | 4 | 3 |
| S | 3 | 2 |
| K/P | 1 each | 0 (walk-on backup exists at most programs) |

## Transfer Portal Strategy

Portal Value = (Player KR x System Fit%) / (Scholarship Cost + NIL Cost)

Portal targets should be evaluated with a 3-step process:
1. **Need Assessment** -- Which position groups are below minimum viable depth or below conference-average KR?
2. **System Fit** -- Does the portal target's archetype fit the program's offensive/defensive system at A or B tier?
3. **Immediate Impact** -- Can this player start or contribute in Year 1? Portal acquisitions that need 2+ years of development are poor value.

Portal Risk Factors:
- Multi-transfer players (3+ schools): higher flight risk, potential culture issues
- Late portal entries (after May): limited integration time
- Scheme-dependent producers: high production in one system may not transfer

## Depth Chart Management

Depth chart decisions flow from Team KR optimization:
- Starter: Highest Final System KR at each position
- Backup: Next-highest KR who provides adequate insurance
- Development: Players with high TKR (physical tools) but low current production KR -- redshirt or limited-role candidates
- Specialist: Players with one elite trait (return speed, goal-line power, etc.)

## Recruiting Class Valuation

Recruiting Class KR = Σ (Recruit_Projected_KR_i x Position_Need_Weight_i) / Class_Size

Position Need Weight = (Gap between current group KR and target group KR) / Total gap across all groups.

A class that addresses the largest KR gaps at the most important positions scores highest. A class of 5-star WRs when your OL is the weakest group scores poorly regardless of talent.

---

# GOVERNANCE

Team KR is produced by Nexus. No manual override. All upstream player evaluations are immutable by the time Team KR executes. Change the system selection → all Final System KRs change → different Team KR. This is by design for scenario testing.
